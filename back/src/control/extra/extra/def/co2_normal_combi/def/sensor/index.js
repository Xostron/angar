const { delExtra, wrExtra } = require('@tool/message/extra')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnSensor(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	// resultFan.force.push(false)
	// resultFan.stg = 'co2'
	// delExtra(bld._id, null, 'co2', 'wait')
	// delExtra(bld._id, null, 'co2', 'work')
	// delExtra(bld._id, null, 'co2', 'on')

}

module.exports = fnSensor
