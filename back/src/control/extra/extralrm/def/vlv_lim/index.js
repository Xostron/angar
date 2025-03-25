const { msg } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

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
		wrExtralrm(building._id, section._id, 'vlvLim', msg(building, section, 33))
		acc.alarm = true
	}
}

module.exports = vlvLim
