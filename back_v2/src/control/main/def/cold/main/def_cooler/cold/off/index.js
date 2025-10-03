const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Испаритель выключен
function off(fnChange, accAuto, acc, se, s, bld, clr) {
	// Если был в сливе воды
	// if (acc.state.add) return check.cold(fnChange, 'drain', accAuto,acc, se, s, bld, clr)
	// Не выключался
	if (!acc?.state?.off) {
		acc.state.off = new Date()
		console.log('\toff', 'Не выключался, решаем что делать дальше')
		return check.cold(fnChange, 'off', accAuto,acc, se, s, bld, clr)
	}
	// Время работы в текущем режиме
	onTime('off', acc)
	//Выключен по достижению задания
	const time = compareTime(acc?.state?.off, s?.cooler?.stop)
	console.log(77,'\toff', 'Выключен по достижению задания', time)
	// вкл обдув: напорный вентилятор - 1, соленоид - 0, обогрев - 0
	if (time) return fnChange(0, 1, 0, 0, 'blow', clr)

}

module.exports = off
