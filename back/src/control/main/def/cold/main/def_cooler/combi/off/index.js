const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Испаритель выключен
function off(fnChange, accCold, acc, se, s, bld, clr) {
	// Не выключался
	if (!acc?.state?.off) {
		acc.state.off = new Date()
		console.log('\toff', 'Не выключался, решаем что делать дальше')
	}
	// Время работы в текущем режиме
	onTime('off', acc)
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

	check.combi(fnChange, 'off', accCold, acc, se, s, bld, clr)
	//Выключен по достижению задания
}

module.exports = off
