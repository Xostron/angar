const { msg } = require('@tool/message')
const { getSignal, getSig } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Нет питания концевиков клапана (секция)
function vlvLim(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал
	const sig = getSignal(section?._id, obj, 'vlvLim')
	const moduleId = getSig(section?._id, obj, 'vlvLim')?.module?.id
	// Сброс
	if (!sig) {
		delExtralrm(building._id, section._id, 'vlvLim')
		acc._alarm = false
	}
	// Установка
	if (sig && !acc._alarm) {
		wrExtralrm(building._id, section._id, 'vlvLim', msg(building, section, 33), [moduleId])
		acc._alarm = true
	}
	return acc._alarm
}

module.exports = vlvLim
