const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime, remTime } = require('@tool/command/time')
const { msgB } = require('@tool/message')
const { wrExtra, delExtra } = require('@tool/message/extra')

// СО2: Вкл
function on(bld, co2, value, acc, se, s) {
	arrCtrlDO(bld._id, co2, 'on', s)
}

// СО2: Выкл
function off(bld, co2, value, acc, se, s) {
	arrCtrlDO(bld._id, co2, 'off')
}

// СО2: По времени
function time(bld, co2, value, acc, se, s) {
	acc.byTime ??= {}
	acc.byTime.wait ??= new Date()
	let time = compareTime(acc.byTime.wait, s.co2?.wait?.w ?? 60000)
	// 1. Время ожидание не прошло
	if (!time) {
		wrExtra(
			bld._id,
			null,
			'co2',
			msgB(bld, 85, `${remTime(acc.byTime.wait, s.co2?.wait?.w ?? 60000)}`),
			'wait',
		)
		delExtra(bld._id, null, 'co2', 'work')
		off(bld, co2)
		return
	}
	// Время ожидания прошло - работа по времени
	acc.byTime.work ??= new Date()
	delExtra(bld._id, null, 'co2', 'wait')
	wrExtra(bld._id, null, 'co2', msgB(bld, 84, `${remTime(acc.byTime.work, s.co2.work)}`), 'work')
	on(bld, co2)
	time = compareTime(acc.byTime.work, s.co2.work)

	// Время работы вентиляторов истекло - выкл
	if (time) {
		off(bld, co2)
		acc.byTime = {}
	}
}

// СО2: По датчику
function sensor(bld, co2, value, acc, se, s) {
	// Отключено

	if (se?.cooler?.co2 === null || se?.cooler?.co2 === undefined) return off(bld, co2)

	// Вкл
	if (se.cooler.co2 > s.co2.sp) on(bld, co2)

	// Выкл
	if (se.cooler.co2 + s.co2.hysteresis < s.co2.sp) off(bld, co2)
}

module.exports = {
	on,
	time,
	sensor,
	off,
}

// function time(bld, co2, value, acc, se, s) {
// 	// Фиксируем время работы, вентиляторы - вкл
// 	if (!acc?.work || compareTime(acc.wait, s.co2?.wait?.w ?? 60000)) {
// 		acc.work = new Date()
// 		delete acc.wait
// 		on(bld._id, co2)
// 	}

// 	// Время работы вентиляторов истекло - выкл
// 	if (compareTime(acc.work, s.co2.work) && !acc?.wait) {
// 		off(bld._id, co2)
// 		acc.wait = new Date()
// 	}
// }
