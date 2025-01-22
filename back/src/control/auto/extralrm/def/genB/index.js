const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgB } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Работа от генератора - выкл склада
function genB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал "Работа от генератора"
	const sig = getSignal(building?._id, obj, 'gen')
	const o = { bldId: building._id, code: 'gen' }
	// Сброс
	if (sig === true || isReset(building._id)) {
		delExtralrm(building._id, null, 'gen')
		removeAcc(obj.acc, o, 'extralrm')
		acc.alarm = false
	}
	// Установка
	if (sig === false && !acc.alarm) {
		const mes = { date: new Date(), ...msgB(building, 29) }
		wrExtralrm(building._id, null, 'gen', mes)
		writeAcc(obj.acc, { ...o, mes }, 'extralrm')
		acc.alarm = true
	}
	return acc.alarm ?? null
}

module.exports = genB
