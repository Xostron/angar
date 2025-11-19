const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Испаритель выключен
function off(fnChange, accCold, acc, se, s, bld, clr) {
	// Не выключался
	if (!acc?.state?.off) {
		acc.state.off = new Date()
		console.log('\toff', 'Не выключался, решаем что делать дальше')
	}
	// Проверка ожидания оттайки всех испарителей
	if (acc?.state?.waitDefrost) {
		// Все испарители закончили оттайку
		if (accCold.defrostAllFinish) {
			acc.state.waitDefrost = null
			accCold.targetDT = new Date()
			fnChange(0, 0, 0, 1, 'drain', clr)
			return
		}
		console.log('\tНе все испарители закончили оттайку, ждем')
		// Не все испарители закончили оттайку, ждем дальше в паузе
		return
	}
	// Время работы в текущем режиме
	onTime('off', acc)

	//Выключен по достижению задания, здесь мы СТРОГО ЖДЕМ время останова по достижению задания
	if (accCold.finishTarget) {
		const time = compareTime(accCold.finishTarget, s?.coolerCombi?.stop)
		console.log('\toff', 'Выключен по достижению задания', time, s?.coolerCombi?.stop)
		// Время ожидания прошло
		if (time) {
			accCold.finishTarget = null
			return check.combi(fnChange, 'off', accCold, acc, se, s, bld, clr)
		}
		// Время ожидания не прошло
		return
	}
	// вкл обдув: все ВНО с регулированием по давлению канала
	// if (time) {
	// 	accAuto.finishTarget = null
	// 	// return fnChange(0, 1, 0, 0, 'blow', clr)
	// 	return
	// }

	check.combi(fnChange, 'off', accCold, acc, se, s, bld, clr)
	//Выключен по достижению задания
}

module.exports = off
