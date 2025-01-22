const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgB } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Аварийный стоп
function alrStop(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(building?._id, obj, 'alarm')
	const o = {bldId:building._id, code:'alarm'}
	// Сброс
	if (sig===true || isReset(building._id)) {
		delExtralrm(building._id, null, 'alarm')
		removeAcc(obj.acc, o, 'extralrm')
		acc.alarm = false
	}
	// Установка
	if (sig===false && !acc.alarm) {
		const mes = { date: new Date(), ...msgB(building, 36) }
		wrExtralrm(building._id, null, 'alarm', mes)
		writeAcc(obj.acc, {...o, mes}, 'extralrm')
		acc.alarm = true
	}
	return acc?.alarm ?? false
}

module.exports = alrStop