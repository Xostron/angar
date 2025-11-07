const { msgB } = require('@tool/message')
const { curStateV } = require('@tool/command/valve')
const { compareTime } = require('@tool/command/time')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const _WAIT = 5 * 60 * 1000
const _RESET = 1 * 60 * 60 * 1000

/**
 * @description Доп. авария склада: Температура канала выше температуры продукта
 * @param {object} building Склад
 * @param {undefined} section Секция недоступна для доп аварий склада
 * @param {object} obj Рама
 * @param {object} s Настройки
 * @param {object} seB Датчики склада
 * @param {object} m Периферия склада
 * @param {string} automode авторежим склада
 * @param {object} acc аккумулятор аварии
 * @param {null} data доп. данные (используются секционными доп авариями)
 * @returns {boolean} авария
 */
module.exports = function openVin(building, section, obj, s, seB, m, automode, acc, data) {
	// Только для режима храненния || Нет приточных клапанов - не выполняем
	if (automode !== 'cooling' || !m?.vlvIn?.length) return false
	
	// Есть ли хоть один открытый приточный клапан
	const hasOpen = m.vlvIn.some((el) => curStateV(el._id, obj.value) === 'opn')
	// Клапан открыт и темп.канала > темп. продукта
	const attn = hasOpen && seB.tcnl > seB.tprd

	// Условие аварии отрицательно или нажата кнопка сброса аварии
	if (!attn && !acc?.alarm) fnReset(building, acc)
	// Условие аварии положительно
	// Фиксируем время возникновения условий аварии и ждем 5 мин
	if (attn && !acc?.open) acc.open = new Date()
	// Время ожидания 5 мин закончилось
	const hasWait = compareTime(acc?.open, _WAIT)
	// Вкл аварии и фиксация времени для сброса аварии 1 час
	if (hasWait && !acc?.reset) {
		wrExtralrm(building._id, null, 'openVin', msgB(building, 39))
		acc.reset = new Date()
		acc.alarm = true
	}
	// Время ожидания сброса аварии закончилось
	const hasReset = compareTime(acc?.reset, _RESET)
	if (hasReset && acc?.alarm) fnReset(building, acc)
	return acc?.alarm ?? false
}

/**
 * @description Процедура очистки аварийного сообщения
 * @param {*} building склад
 * @param {*} acc аккумулятор данной аварии
 */
function fnReset(building, acc) {
	delExtralrm(building._id, null, 'openVin')
	delete acc.reset
	delete acc.alarm
	delete acc.open
}
