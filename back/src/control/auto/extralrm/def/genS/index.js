const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msg } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Работа от генератора - выкл секции
function genS(building, section, obj, s, se, m, automode, acc, data) {
	acc[section._id] ??= {}
	const sig = getSignal(section?._id, obj, 'gen')
	const o = { bldId: building._id, secId: section._id, code: 'gen' }
	// Сброс
	if (sig === true || isReset(building._id)) {
		delExtralrm(building._id, section._id, 'gen')
		removeAcc(obj.acc, o, 'extralrm')
		acc[section._id].alarm = false
	}
	// Установка
	if (sig === false && !acc[section._id].alarm) {
		const mes = { date: new Date(), ...msg(building, section, 29) }
		wrExtralrm(building._id, section._id, 'gen', mes)
		writeAcc(obj.acc, { ...o, mes }, 'extralrm')
		acc[section._id].alarm = true
	}
	return acc[section._id]?.alarm ?? false
}

module.exports = genS
