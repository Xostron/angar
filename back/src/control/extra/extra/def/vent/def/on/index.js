const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msg } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Режим вентиляции: Вкл - постоянная вентиляция
// Склад обычный, комби-обычный
function fnOn(obj, s, m, bld, alarm, prepare, acc, resultFan) {
	resultFan.force.push(true)
	resultFan.stg = 'vent'
}

module.exports = fnOn
