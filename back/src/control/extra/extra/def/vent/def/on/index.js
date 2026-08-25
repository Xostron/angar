const { delExtra } = require('@tool/message/extra')

// Режим вентиляции: Вкл - постоянная вентиляция
// Склад обычный, комби-обычный
function fnOn(obj, s, m, bld, alarm, prepare, acc, resultFan) {
	resultFan.force.push(true)
	resultFan.stg.push('vent')
	delExtra(bld._id, null, 'vent', 'wait')
	delExtra(bld._id, null, 'vent', 'work')
	delExtra(bld._id, null, 'vent', 'check')
}

module.exports = fnOn
