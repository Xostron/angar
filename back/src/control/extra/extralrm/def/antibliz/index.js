const { msg } = require('@tool/message')
const { curStateV } = require('@tool/command/valve')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { data: store, readAcc } = require('@store')
const { compareTime } = require('@tool/command/time')
/**
 * @description если за время time, концевик закрыто приточного клапана хлопнул (сработал)
 *  count раз, тогда генерируем аварию (Сработал режим антивьюги) и останов всей секции
 * Сброс аварии по кнопке и после времени ожидания wait
 * @param {*} building
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
	// const extraCO2 = readAcc(building._id, 'building', 'co2')
	// Сбрасываем подсчет при работе удаления СО2
	// if (extraCO2.start) acc.queue = []

	const count = (s.antibliz.count ?? 0) * 2
	fn(building, section, value, vlvS, acc, s, count)

	if (acc._alarm) acc.flag = true

	// Фиксация времени автосброса аварии
	if (acc._alarm && !acc.wait) acc.wait = new Date()
	const wait = s.antibliz.wait === 0 ? false : compareTime(acc.wait, s.antibliz.wait)

	if (
		!s.antibliz.count ||
		!s.antibliz.time ||
		!s.antibliz.wait ||
		!s?.antibliz?.mode ||
		s.antibliz.mode === 'off' ||
		wait
	) {
		delExtralrm(building._id, section._id, 'antibliz')
		acc.queue = []
		acc._alarm = false
		acc.wait = null
	}
	// console.log(99, acc)
	return acc?._alarm ?? false
}

module.exports = antibliz

function fn(building, section, value, vlvS, acc, s, count) {
	acc.queue ??= []
	// Приточный клапан секции: рама и состояние
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	let state = curStateV(vlvIn._id, value)
	const isAlr = isExtralrm(building._id, section._id, 'antibliz')
	if (acc.flag && !acc._alarm) {
		acc.queue = []
		acc.wait = null
		acc.flag = false
	}
	// Уже в аварии - выходим из итерации
	if (isAlr) return
	// Логика
	// Фиксируем состояние клапана
	state = state === 'cls' ? 'cls' : 'other'
	if (acc.queue.at(-1)?.state !== state) acc.queue.push({ state, date: new Date() })
	// Размер очереди превышен
	if (acc.queue.length > count) {
		acc.queue.shift()
	}
	const onlyCls = acc.queue.filter((el) => el.state === 'cls')
	// Очередь не заполнена - выходим
	if (onlyCls.length < s.antibliz.count) return

	const delta = onlyCls.at(-1).date - onlyCls[0].date
	// Время между последними состояниями больше  -> ОК
	if (delta > s.antibliz.time) return
	//Время меньше порога -> установка аварии
	wrExtralrm(building._id, section._id, 'antibliz', msg(building, section, 13))
	acc._alarm = true
}


