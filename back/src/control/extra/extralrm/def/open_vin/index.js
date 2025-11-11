const { curStateV } = require('@tool/command/valve')
const { set, reset, fnCheck } = require('./fn')

/**
 * @description Авария склада: Температура канала выше температуры продукта
 * @param {object} bld Склад
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
module.exports = function openVin(bld, section, obj, s, seB, m, automode, acc, data) {
	// Разрешение работы
	if (!fnCheck(bld, obj, s, automode, m, acc)) return false

	// Условие аварии: Клапан открыт и темп.канала > темп. продукта
	const hasOpen = m.vlvIn.some((el) => curStateV(el._id, obj.value) === 'opn')
	const term = hasOpen && seB.tcnl > seB.tprd

	// Автосброс аварии
	reset(bld, s, acc, term)
	// Установка аварии
	set(bld, s, acc, term)
	return acc?._alarm ?? false
}
