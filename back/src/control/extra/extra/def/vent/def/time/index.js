const { msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime, remTime } = require('@tool/command/time')

// Режим вентиляции: Авто - по времени
function fnTime(obj, s, m, bld, alarm, prepare, acc, resultFan) {
	delExtra(bld._id, null, 'vent', 'ventOn')

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
			msgB(bld, 141, `${remTime(acc.byTime.wait, s.vent.wait)}`),
			'wait'
		)
		delExtra(bld._id, null, 'vent', 'work')
		return
	}
	// Время ожидания прошло. Работа ВВ
	acc.byTime.work ??= new Date()
	delExtra(bld._id, null, 'vent', 'wait')
	wrExtra(
		bld._id,
		null,
		'vent',
		msgB(bld, 142, `${remTime(acc.byTime.work, s.vent.work)}`),
		'work'
	)

	resultFan.force.push(true)
	resultFan.stg = 'vent'
	time = compareTime(acc.byTime.work, s.vent.work)
	// console.log(77, 'ВВ комби-холод - работа')
	if (time) {
		if (!s.vent.wait) {
			delete acc.byTime?.wait
			delete acc.byTime?.work
			delExtra(bld._id, null, 'vent', 'work')
			return
		}
		// Время работы прошло
		delete acc.byTime?.wait
		delete acc.byTime?.work
		delExtra(bld._id, null, 'vent', 'work')
		resultFan.force.push(false)
		resultFan.stg = null
	}
}

module.exports = fnTime
