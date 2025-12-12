const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnOn(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	resultFan.force.push(true)
	resultFan.stg.push('co2')
	wrExtra(bld._id, null, 'co2', msgB(bld, 84), 'work')
	delExtra(bld._id, null, 'co2', 'wait')
	// delExtra(bld._id, null, 'co2', 'work')
}

module.exports = fnOn
