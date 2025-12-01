const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime, runTime } = require('@tool/command/time')

// Режим вентиляции: Авто - по времени
function fnTime(obj, s, m, bld, alarm, prepare, acc, resultFan) {
	acc.byTime ??= {}
	// Ожидание ВВ
	acc.byTime.wait ??= new Date()
	let time = compareTime(acc.byTime.wait, s.vent.wait)
	if (!time) {
		// Время ожидание не прошло
		wrExtra(
			bld._id,
			null,
			'vent',
			msgB(bld, 141, `${s.vent.wait / 60 / 1000}мин  (${runTime(acc.byTime.wait)})`),
			'wait'
		)
		return
	}
	// Время ожидания прошло. Работа ВВ
	acc.byTime.work ??= new Date()
	delExtra(bld._id, null, 'vent', 'wait')
	wrExtra(
		bld._id,
		null,
		'vent',
		msgB(bld, 142, `${s.vent.work / 60 / 1000}мин (${runTime(acc.byTime.work)})`),
		'work'
	)
	resultFan.force.push(true)
	resultFan.stg = 'vent'
	time = compareTime(acc.byTime.work, s.vent.work)
	// console.log(77, 'ВВ комби-холод - работа')
	if (time) {
		// Время работы прошло
		delete acc.byTime?.wait
		delete acc.byTime?.work
		delExtra(bld._id, null, 'vent', 'work')
		resultFan.force.push(false)
		resultFan.stg = null
	}
}

module.exports = fnTime
