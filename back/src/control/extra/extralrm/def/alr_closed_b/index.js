const { msgB } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Аварийное закрытие клапанов - по низкой температуре (склад)
function alrClosedB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(building?._id, obj, 'low')
	// Сброс
	if (!sig) {
		delExtralrm(building._id, null, 'alrClosed')
		acc._alarm = false
	}
	// Установка
	if (sig && !acc._alarm) {
		wrExtralrm(building._id, null, 'alrClosed', msgB(building, 26))
		acc._alarm = true
	}
	return acc._alarm ?? null
}

module.exports = alrClosedB

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */
