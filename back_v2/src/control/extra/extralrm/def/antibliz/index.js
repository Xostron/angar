const { msg } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { stateV } = require('@tool/command/valve')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

/**
 * @description если за время time, концевик закрыто приточного клапана хлопнул (сработал)
 *  count раз, тогда генерируем аварию (Сработал режим антивьюги) и останов всей секции
 * Сброс аварии по кнопке и после времени ожидания wait
 * @param {*} buildingId
 * @param {*} section секция
 * @param {*} obj Данные основного цикла
 * @param {*} s Настройки склада
 * @param {*} se Показания датчиков секции
 * @param {*} m Исполнительные механизмы
 * @param {*} acc Данные о вычисления доп. аварий
 * @param {*} data Данные от авторежима
 * @returns {} alarm:bool Авария, datalog:{дата аварии и текст аварии}, reset:bool сброс аварии
 */
function antibliz(building, section, obj, s, se, m, automode, acc, data) {
	const { retain, factory, value } = obj
	const { vlvS } = m

	// Настроек нет - функцию не выполняем
	if (!s.antibliz.count || !s.antibliz.time || !s.antibliz.wait || !s?.antibliz?.mode || s.antibliz.mode === 'off') return null
	// Приточный клапан секции
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	const state = stateV(vlvIn?._id, value, building._id, vlvIn?.sectionId?.[0])

	// Логика
	// Текущее время
	const curTime = +new Date().getTime()
	// Проверка диапазона времени
	const validTime = curTime > acc.beginTime && curTime <= acc.endTime
	// Инициализация функции: по истечению времени слежения и/или время слежения еще не задано
	if (!validTime && !acc.alarm) {
		// Временной интервал слежения за клапаном
		acc.beginTime = +new Date().getTime()
		acc.endTime = acc.beginTime + s.antibliz.time
		// Прошлое состояние клапана
		acc.lastSt = state
		// Счетчик хлопков
		acc.cnt = 0
		// Сигнал аварии
		acc.alarm = false
		delExtralrm(building._id, section._id, 'antibliz')
	}

	// Ловим хлопки закрытого концевика клапана
	if (acc.lastSt != 'cls' && state === 'cls' && !acc.alarm && validTime) {
		if (++acc.cnt >= s.antibliz.count) {
			// Авария: Сработал режим антивьюги
			acc.alarm = true
			acc.beginWait = +new Date().getTime()
			acc.endWait = acc.beginWait + s.antibliz.wait
			wrExtralrm(building._id, section._id, 'antibliz', msg(building, section, 13))
		}
	}
	// Обновление состояния клапана после проверки в каждой итерации
	acc.lastSt = state

	// Сброс аварии - По времени ожидания
	if (curTime >= acc.endWait || isReset(building._id)) {
		delete acc.alarm
		delete acc.beginTime
		delete acc.endTime
		delete acc.beginWait
		delete acc.endWait
		delete acc.lastSt
		delete acc.cnt
		delExtralrm(building._id, section._id, 'antibliz')
	}
	return acc?.alarm ?? false
}

module.exports = antibliz
