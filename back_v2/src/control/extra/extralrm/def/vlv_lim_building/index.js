const { msgB } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Нет питания концевиков клапана (склад)
function vlvLimB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(building?._id, obj, 'vlvLim')
	// Сброс
	if (!sig || isReset(building._id)) {
		delExtralrm(building._id, null, 'vlvLim')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		wrExtralrm(building._id, null, 'vlvLim', msgB(building, 33))
		acc.alarm = true
	}
}

module.exports = vlvLimB
