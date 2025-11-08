const { msg } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Нет питания концевиков клапана (секция)
function vlvLim(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал
	const sig = getSignal(section?._id, obj, 'vlvLim')
	// Сброс
	if (!sig) {
		delExtralrm(building._id, section._id, 'vlvLim')
		acc._alarm = false
	}
	// Установка
	if (sig && !acc._alarm) {
		wrExtralrm(building._id, section._id, 'vlvLim', msg(building, section, 33))
		acc._alarm = true
	}
}

module.exports = vlvLim
