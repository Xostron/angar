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
	check.combi(fnChange, 'off', accCold, acc, se, s, bld, clr)
	//Выключен по достижению задания
}

module.exports = off
