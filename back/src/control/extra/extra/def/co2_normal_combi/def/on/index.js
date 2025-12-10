const { delExtra, wrExtra } = require('@tool/message/extra')

// Режим вентиляции: Выкл
// Склад обычный, комби-обычный
function fnOn(bld, obj, s, se, m, alarm, prepare, acc, resultFan) {
	console.log(8800, 'on', alarm)
	resultFan.force.push(true)
	resultFan.stg = 'co2'
	wrExtra(bld._id, null, 'co2', msgB(bld, 62), 'on')
	delExtra(bld._id, null, 'co2', 'wait')
	delExtra(bld._id, null, 'co2', 'work')
}

module.exports = fnOn
