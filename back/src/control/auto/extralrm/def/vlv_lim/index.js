const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msg } = require('@tool/message')

// Нет питания концевиков клапана (секция)
function vlvLim(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал
	const sig = getSignal(section?._id, obj, 'vlvLim')
	// Сброс
	if (!sig || isReset(building._id)) {
		delExtralrm(building._id, section._id, 'vlvLim')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		wrExtralrm(building._id, section._id, 'vlvLim', { date: new Date(), ...msg(building, section, 33) })
		acc.alarm = true
	}
}

module.exports = vlvLim


