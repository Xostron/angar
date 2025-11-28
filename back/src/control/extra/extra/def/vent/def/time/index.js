const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Режим вентиляции: Авто - по времени
function fnTime(obj, s, m, bld, value, alarm, prepare, acc, resultFan) {
	// Аккумулятор вычислений
	acc.byTime ??= {}
	// Отключение: нет настройки, аварии, бит завершения по времени, сейчас работает подхват
	if (
		typeof s.vent.work !== 'number' ||
		(Object.values(acc?.byDura ?? {}).length && !acc?.byDura.finish)
	) {
		acc.byTime = {}
		// console.log(
		// 	1117,
		// 	'vent reset byTime',
		// 	typeof s.vent.work !== 'number',
		// 	Object.values(acc?.byDura).length
		// )
		delExtra(bld._id, null, 'vent_time_wait')
		delExtra(bld._id, null, 'vent_time')
		return
	}

	// Ожидание
	acc.byTime.wait ??= new Date()
	let time = compareTime(acc.byTime.wait, s.vent.wait)
	// Время не прошло
	if (!time) {
		wrExtra(bld._id, null, 'vent_time_wait', msgB(bld, 87, `${s.vent.wait / 60 / 1000}мин)`))
		// console.log(1118, 'vent: Ожидание', acc.byTime.wait, s.vent.wait)
		return
	}
	// Вкл вентиляции, когда истечет время ожидания
	resultFan.start = [true]
	acc.byTime.start = true
	delExtra(bld._id, null, 'vent_time_wait')
	wrExtra(bld._id, null, 'vent_time', msgB(bld, 88, `${s.vent.work / 60 / 1000}мин)`))
	acc.byTime.work ??= new Date()
	time = compareTime(acc.byTime.work, s.vent.work)
	// Время работы прошло
	if (time) {
		delete acc.byTime?.work
		delete acc.byTime?.wait
		// delete acc.byTime?.start
		resultFan.start = [false]
		delExtra(bld._id, null, 'vent_time')
	}
}

module.exports = fnTime
