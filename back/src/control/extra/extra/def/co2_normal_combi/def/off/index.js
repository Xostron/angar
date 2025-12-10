const { delExtra, wrExtra } = require('@tool/message/extra')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnOff(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	console.log(8800, 'off', alarm)
	resultFan.force.push(false)
	resultFan.stg = null
	delExtra(bld._id, null, 'co2', 'wait')
	delExtra(bld._id, null, 'co2', 'work')
	delExtra(bld._id, null, 'co2', 'on')

}

module.exports = fnOff
