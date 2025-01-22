const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msg } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Нет питания концевиков клапана (секция)
function vlvLim(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал
	const sig = getSignal(section?._id, obj, 'vlvLim')
	const o = { bldId: building._id, secId: section._id, code: 'vlvLim' }
	// Сброс
	if (!sig || isReset(building._id)) {
		delExtralrm(building._id, section._id, 'vlvLim')
		removeAcc(obj.acc, o, 'extralrm')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		const mes = { date: new Date(), ...msg(building, section, 33) }
		wrExtralrm(building._id, section._id, 'vlvLim', mes)
		writeAcc(obj.acc, { ...o, mes }, 'extralrm')
		acc.alarm = true
	}
}

module.exports = vlvLim
