const { msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime, remTime } = require('@tool/command/time')
const { readAcc } = require('@store/index')

// Комби-холод. Тпродукта достигла задания
function fnCC(obj, s, m, bld, alarm, prepare, acc, resultFan) {
	delExtra(bld._id, null, 'vent', 'ventOn')
	acc.CC ??= {}
	// Аккумулятор склада комби-холодильника
	const accCold = readAcc(bld._id, 'combi')?.cold

	// Ожидание обдува начинается после достижения задания
	acc.CC.wait = accCold?.finishTarget
	let time = compareTime(acc.CC.wait, s.coolerCombi.stop)

	if (!time) {
		// Время ожидание достижения задания не прошло
		wrExtra(
			bld._id,
			null,
			'vent',
			msgB(bld, 87, `${remTime(acc.CC.wait, s.coolerCombi.stop)}`),
			'wait'
		)
		return
	}
	// Время ожидания прошло достижения задания. Работа ВВ
	acc.CC.work ??= new Date()
	delExtra(bld._id, null, 'vent', 'wait')
	wrExtra(
		bld._id,
		null,
		'vent',
		msgB(bld, 88, `${remTime(acc.CC.work, s.coolerCombi.work)}`),
		'work'
	)
	resultFan.force.push(true)
	resultFan.stg = 'coolerCombi'
	time = compareTime(acc.CC.work, s.coolerCombi.work)
	// console.log(77, 'ВВ комби-холод - работа')
	if (time) {
		// Время работы прошло
		delete acc.CC?.wait
		delete acc.CC?.work
		accCold.finishTarget = null
		// accCold.blow = null
		delExtra(bld._id, null, 'vent', 'work')
		resultFan.force.push(false)
		resultFan.stg = null
	}
}

module.exports = fnCC

// function fnCC(obj, s, m, bld, alarm, prepare, acc, resultFan) {
// 	delExtra(bld._id, null, 'vent', 'ventOn')
// 	acc.CC ??= {}
// 	// Ожидание ВВ
// 	acc.CC.wait ??= new Date()
// 	let time = compareTime(acc.CC.wait, s.coolerCombi.wait)
// 	// console.log(77, 'ВВ комби-холод - ожидание', time, acc.CC.wait, s.coolerCombi.wait)
// 	if (!time) {
// 		// Время ожидание не прошло
// 		wrExtra(
// 			bld._id,
// 			null,
// 			'vent',
// 			msgB(bld, 141, `${remTime(acc.CC.wait, s.coolerCombi.wait)}`),
// 			'wait'
// 		)
// 		return
// 	}
// 	// Время ожидания прошло. Работа ВВ
// 	acc.CC.work ??= new Date()
// 	delExtra(bld._id, null, 'vent', 'wait')
// 	wrExtra(
// 		bld._id,
// 		null,
// 		'vent',
// 		msgB(bld, 142, `${remTime(acc.CC.work, s.coolerCombi.work)}`),
// 		'work'
// 	)
// 	resultFan.force.push(true)
// 	resultFan.stg = 'coolerCombi'
// 	time = compareTime(acc.CC.work, s.coolerCombi.work)
// 	// console.log(77, 'ВВ комби-холод - работа')
// 	if (time) {
// 		// Время работы прошло
// 		delete acc.CC?.wait
// 		delete acc.CC?.work
// 		delExtra(bld._id, null, 'vent', 'work')
// 		resultFan.force.push(false)
// 		resultFan.stg = null
// 	}
// }
