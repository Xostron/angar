const { compareTime, onTime, remTime } = require('@tool/command/time')
const check = require('../../../check')
const { wrAchieve } = require('@tool/message/achieve')
const { msgB } = require('@tool/message')

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

	//Выключен по достижению задания, здесь мы СТРОГО ЖДЕМ время останова 
	// по достижению задания
	if (accCold.finishTarget) {
		console.log('\toff', 'Выключен по достижению задания', s?.coolerCombi?.stop)
		// По окончанию времени достижения задания -> включается внутренняя вентиляция ОБДУВ
		// По окончанию обдува сбрасывается accCold.finishTarget=null
		wrAchieve(
			bld._id,
			bld.type,
			msgB(
				bld,
				80,
				`${accCold.tgtTprd ?? '--'} °C. Зад. влажности = ${s?.mois?.humidity ?? '--'}`
			)
		)
		return
	}

	check.combi(fnChange, 'off', accCold, acc, se, s, bld, clr)
	//Выключен по достижению задания
}

module.exports = off
