const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Испаритель выключен
function off(fnChange, accAuto, acc, se, s, bld, clr) {
	// Не выключался
	if (!acc?.state?.off) {
		acc.state.off = new Date()
		console.log('\toff', 'Не выключался, решаем что делать дальше')
		// return check.cold(fnChange, 'off', accAuto, acc, se, s, bld, clr)
	}
	// Проверка ожидания оттайки всех испарителей
	if (acc?.state?.waitDefrost) {
		// Все испарители закончили оттайку
		if (accAuto.defrostAllFinish) {
			acc.state.waitDefrost = null
			accAuto.targetDT = new Date()
			fnChange(0, 0, 0, 1, 'drain', clr)
			return
		}
		console.log('\tНе все испарители закончили оттайку, ждем')
		// Не все испарители закончили оттайку, ждем дальше в паузе
		return
	}
	// Время работы в текущем режиме
	onTime('off', acc)

	//Выключен по достижению задания compareTime(acc?.state?.off, s?.cooler?.stop)
	const time = accAuto.finishTarget && compareTime(accAuto.finishTarget, s?.cooler?.stop)
	console.log('\toff', 'Выключен по достижению задания', time)
	// вкл обдув: напорный вентилятор - 1, соленоид - 0, обогрев - 0
	if (time) return fnChange(0, 1, 0, 0, 'blow', clr)
	check.cold(fnChange, 'off', accAuto, acc, se, s, bld, clr)
}

// Испаритель выключен
// function off(fnChange, accAuto, acc, se, s, bld, clr) {
// 	// Не выключался
// 	if (!acc?.state?.off) {
// 		acc.state.off = new Date()
// 		console.log('\toff', 'Не выключался, решаем что делать дальше')
// 	}
// 	// Время работы в текущем режиме
// 	onTime('off', acc)
// 	// Проверка ожидания оттайки всех испарителей
// 	if (acc?.state?.waitDefrost) {
// 		// Все испарители закончили оттайку
// 		if (accAuto.defrostAllFinish) {
// 			acc.state.waitDefrost = null
// 			accAuto.targetDT = new Date()
// 			fnChange(0, 0, 0, 1, 'drain', clr)
// 			return
// 		}
// 		console.log('\tНе все испарители закончили оттайку, ждем')
// 		// Не все испарители закончили оттайку, ждем дальше в паузе
// 		return
// 	}

// 	check.combi(fnChange, 'off', accAuto, acc, se, s, bld, clr)
// 	//Выключен по достижению задания
// }

module.exports = off
