const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const { runTime } = require('@tool/command/time')
const { defClear } = require('../../fn/exit')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnOn(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	defClear.on(bld,acc)
	resultFan.force.push(true)
	resultFan.stg.push('co2')
	acc.byOn.work??=new Date()
	wrExtra(bld._id, null, 'co2', msgB(bld, 84, runTime(acc.byOn.work)), 'work')
}

module.exports = fnOn
