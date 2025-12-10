const { msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime, remTime } = require('@tool/command/time')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnTime(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	delExtra(bld._id, null, 'co2', 'on')
	acc.byTime ??= {}
	// Ожидание
	acc.byTime.wait ??= new Date()
	let time = compareTime(acc.byTime.wait, s.vent.wait)

	if (!time) {
		// Время ожидание не прошло
		wrExtra(
			bld._id,
			null,
			'co2',
			msgB(bld, 85, `${remTime(acc.byTime.wait, s.co2.wait)}`),
			'wait'
		)
		delExtra(bld._id, null, 'co2', 'work')
		return
	}
	// Время ожидания прошло. Работа ВВ
	acc.byTime.work ??= new Date()
	delExtra(bld._id, null, 'co2', 'wait')
	wrExtra(bld._id, null, 'co2', msgB(bld, 84, `${remTime(acc.byTime.work, s.co2.work)}`), 'work')

	resultFan.force.push(true)
	resultFan.stg = 'co2'
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
