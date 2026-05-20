const { msgB } = require('@tool/message')
const { getSignal, getSig } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Нет питания концевиков клапана (склад)
function vlvLimB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(building?._id, obj, 'vlvLim')
	const moduleId = getSig(building?._id, obj, 'vlvLim')?.module?.id
	// Сброс
	if (!sig) {
		delExtralrm(building._id, null, 'vlvLim')
		acc._alarm = false
	}
	// Установка
	if (sig && !acc._alarm) {
		wrExtralrm(building._id, null, 'vlvLim', msgB(building, 33), [moduleId])
		acc._alarm = true
	}
	return acc._alarm
}

module.exports = vlvLimB
