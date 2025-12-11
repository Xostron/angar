const { delExtra, wrExtra } = require('@tool/message/extra')
const { checkNow } = require('../time/check')
const { runTime } = require('@tool/command/time')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnSensor(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	const { co2 } = prepare
	delExtra(bld._id, null, 'co2', 'wait')
	delExtra(bld._id, null, 'co2', 'work')
	delExtra(bld._id, null, 'co2', 'on')
	acc.bySensor ??= {}
	// Проверка условий
	if (!checkNow(bld, prepare, s)) {
		delExtra(bld._id, null, 'co2', 'work')
		// Проверка не пройдена
		resultFan.force.push(false)
		resultFan.stg = null
		return
	}
	// Проверка пройден -> проверка по датчику СО2

	if (co2 >= s?.co2?.sp) {
		acc.bySensor.work = new Date()
	}
	if (co2 < s?.co2?.sp - s?.co2?.hysteresis) {
		acc.bySensor.work = null
	}
	if (!acc.bySensor.work) {
		delExtra(bld._id, null, 'co2', 'work')
		// Проверка не пройдена
		resultFan.force.push(false)
		resultFan.stg = null
		return
	}
	wrExtra(bld._id, null, 'co2', msgB(bld, 84, `по датчику ${runTime(acc.bySensor.work)}`), 'work')
	resultFan.force.push(true)
	resultFan.stg = 'co2'
}

module.exports = fnSensor
