const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msg } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Комби-холод. Тпродукта достигла задания
function fnCC(obj, s, m, bld, sect, value, fanS, vlvS, alarm, acc, resultFan) {
	console.log(77, 'ВВ комби-холод в работе')
	acc.CC ??= {}
	// Ожидание
	acc.CC.wait ??= new Date()
	let time = compareTime(acc.CC.wait, s.coolerCombi.wait)

	console.log(77, 'ВВ комби-холод - ожидание', time, acc.CC.wait, s.coolerCombi.wait)
	if (!time) {
		wrExtra(
			bld._id,
			sect._id,
			'ventCCwait',
			msg(bld, sect, 141, `${s.coolerCombi.wait / 60 / 1000}мин`)
		)
		return
	}
	// Работа
	console.log(77, 'ВВ комби-холод - работа')
	delExtra(bld._id, sect._id, 'ventCCwait')
	wrExtra(
		bld._id,
		sect._id,
		'ventCCwork',
		msg(bld, sect, 142, `${s.coolerCombi.work / 60 / 1000}мин`)
	)
	resultFan.force.push(true)
	resultFan.stg = 'coolerCombi'
	acc.CC.work ??= new Date()
	time = compareTime(acc.CC.work, s.vent.work)
	if (time) {
		delete acc.CC?.wait
		delete acc.CC?.work
		delExtra(bld._id, sect._id, 'ventCCwork')
		resultFan.force.push(false)
		resultFan.stg = null
	}
}

module.exports = fnCC
