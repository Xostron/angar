const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msg } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

function fnCC(obj, s, m, bld, sect, value, fanS, vlvS, alarm, acc, resultFan) {
	console.log(77, 'ВВ комби склада в режиме холодильника в работе')
	resultFan.force.push(true)
	resultFan.stg = 'coolerCombi'
}

module.exports = fnCC
