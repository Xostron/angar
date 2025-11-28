const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msg } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnOff(obj, s, m, bld, alarm, prepare, acc, resultFan) {
	resultFan.force.push(false)
	resultFan.stg = null
}

module.exports = fnOff
