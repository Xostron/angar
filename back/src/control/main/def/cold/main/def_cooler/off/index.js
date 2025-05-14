const { compareTime } = require('@tool/command/time')
const check = require('../check')
const onTime = require('../on_time')

// Испаритель выключен
function off(fnChange, acc, se, s, bld, clrId) {
	// Не выключался
	if (!acc?.state?.off) {
		acc.state.off = new Date()
		console.log('\toff', 'Не выключался, решаем что делать дальше')
		return check(fnChange, 'off', acc, se, s, bld, clrId)
	}
	// Время работы в текущем режиме
	onTime('off', acc)
	//Выключен по достижению задания
	// TODO Ожидание Только для холодильника, а для комбинированного работа по acc.finish (True достиг задания - выкл испаритель)
	// false - вкл холодильник
	const time = compareTime(acc?.state?.off, s?.cooler?.stop)
	console.log(777,'\toff', 'Выключен по достижению задания', time)
	// вкл обдув: напорный вентилятор - 1, соленоид - 0, обогрев - 0
	if (time) return fnChange(0, 1, 0, 0, 'blow', clrId)

}

module.exports = off
