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
	// TODO Ожидание Только для холодильника, а для комбинированного работа по acc.finish (True достиг задания - выкл испаритель)
	// false - вкл холодильник
	// const time = compareTime(acc?.state?.off, s?.coolerCombi?.stop)
	// console.log(77, '\toff', 'Выключен по достижению задания', time)
	// вкл обдув: напорный вентилятор - 1, соленоид - 0, обогрев - 0
	// if (time) return 
	// fnChange(0, 1, 0, 0, 'blow', clr)
}

module.exports = off
