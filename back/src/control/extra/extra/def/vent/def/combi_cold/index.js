const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Комби-холод. Тпродукта достигла задания
function fnCC(obj, s, m, bld, value, fanS, vlvS, alarm, acc, resultFan) {
	console.log(77, 'ВВ комби-холод в работе', acc.CC)
	acc.CC ??= {}
	// Ожидание ВВ
	acc.CC.wait ??= new Date()
	let time = compareTime(acc.CC.wait, s.coolerCombi.wait)
	console.log(77, 'ВВ комби-холод - ожидание', time, acc.CC.wait, s.coolerCombi.wait)
	if (!time) {
		// Время ожидание не прошло
		wrExtra(bld._id, null, 'ventCCwait', msgB(bld, 141, `${s.coolerCombi.wait / 60 / 1000}мин`))
		return
	}
	// Время ожидания прошло. Работа ВВ
	console.log(77, 'ВВ комби-холод - работа')
	delExtra(bld._id, null, 'ventCCwait')
	wrExtra(bld._id, null, 'ventCCwork', msgB(bld, 142, `${s.coolerCombi.work / 60 / 1000}мин`))
	resultFan.force.push(true)
	resultFan.stg = 'coolerCombi'
	acc.CC.work ??= new Date()
	time = compareTime(acc.CC.work, s.coolerCombi.work)
	if (time) {
		// Время работы прошло
		delete acc.CC?.wait
		delete acc.CC?.work
		delExtra(bld._id, null, 'ventCCwork')
		resultFan.force.push(false)
		resultFan.stg = null
	}
}

module.exports = fnCC
