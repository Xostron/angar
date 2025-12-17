const { compareTime, remTime } = require('@tool/command/time')
const { wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const { clear } = require('../check')
// Минимальное вычисляемое время работы ВНО 12с
const _MIN_DELTA_TIME = 12 * 1000

function calc(bld, prepare, resultFan) {
	const { acc, cmd, isCN, isN, alrAuto, notDur, achieve, idsS, s } = prepare
	acc.byDur ??= {}
	acc.byDur.queue ??= []
	// acc.byDur.start = false
	// 1. Фиксация работы ВНО
	if (!acc.byDur.queue[0] && cmd.start) {
		acc.byDur.queue[0] = { start: true, date: new Date() }
		acc.byDur.queue[1] = null
		return
	}
	// 2. Фиксация останова ВНО по достижению задания или аварий авторежима
	if (acc.byDur.queue[0] && !acc.byDur.queue[1] && !cmd.start && (alrAuto || achieve)) {
		acc.byDur.queue[1] = { start: false, date: new Date() }
	}
	// 3. Проверка очереди: наличие 1 и 2 фиксации
	if (!acc.byDur.queue?.[0]?.date || !acc.byDur.queue?.[1]?.date) return

	// Вычисление времени работы ВНО: Защита от отрицательного времени, сбрасываем очередь
	const deltaTime = acc.byDur.queue[1].date - acc.byDur.queue[0].date
	if (deltaTime < _MIN_DELTA_TIME) {
		acc.byDur.queue = []
		return
	}

	// 4. Расчет времени доп. вентиляции, мс
	let spTime = (deltaTime * s.vent.add) / 100
	spTime = spTime > s.vent.max_add ? s.vent.max_add : spTime

	// console.log(
	// 	'\tspTime',
	// 	spTime,
	// 	's.vent.max_add',
	// 	s.vent.max_add,
	// 	remTime(acc.byDur.queue[1].date, spTime)
	// )

	// 5. Следим за временем работы ДВ
	const time = compareTime(acc.byDur.queue[1].date, spTime)
	if (!time) {
		// Время работы ДВ не прошло
		// Включаем доп. вентиляцию
		resultFan.start.push(true)
		// acc.byDur.start = true
		wrExtra(
			bld._id,
			null,
			'durVent',
			msgB(bld, 149, `${remTime(acc.byDur.queue[1].date, spTime)}`),
			'work'
		)
		return
	}

	// 6. Время работы ДВ прошло. Выключаем доп. вентиляцию
	resultFan.start.push(false)
	clear(bld, prepare)
}

module.exports = calc
