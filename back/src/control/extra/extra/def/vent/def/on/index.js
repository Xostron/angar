const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

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
