const { delExtra, wrExtra } = require('@tool/message/extra')
const { checkNow } = require('../time/check')
const { runTime } = require('@tool/command/time')
const { defClear } = require('../../fn/exit')
const { msgB } = require('@tool/message')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnSensor(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	defClear.sensor(bld, acc)
	// Проверка условий
	if (!checkNow(bld, prepare, s, acc)) {
		delExtra(bld._id, null, 'co2', 'work')
		// Проверка не пройдена
		resultFan.force.push(false)
		resultFan.stg.push(null)
		return
	}
	// Проверка пройдена -> проверка по датчику СО2

	// if (co2 >= s?.co2?.sp) {
	// 	acc.bySensor.work = new Date()
	// }
	// if (co2 < s?.co2?.sp - s?.co2?.hysteresis) {
	// 	acc.bySensor.work = null
	// }

	if (!acc.bySensor.work) {
		// CO2 в норме -> выключаем
		delExtra(bld._id, null, 'co2', 'work')
		resultFan.force.push(false)
		resultFan.stg.push(null)
		return
	}
	// CO2 превышена -> включаем
	wrExtra(bld._id, null, 'co2', msgB(bld, 84, `по датчику ${runTime(acc.bySensor.work)}`), 'work')
	resultFan.force.push(true)
	resultFan.stg.push('co2')
}

module.exports = fnSensor
