const { msg } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Аварийное закрытие клапанов - по низкой температуре
function alrClosed(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(section?._id, obj, 'low')
	// Сброс
	if (!sig) {
		delExtralrm(building._id, section._id, 'alrClosed')
		acc._alarm = false
	}
	// Установка
	if (sig && !acc._alarm) {
		wrExtralrm(building._id, section._id, 'alrClosed', {
			date: new Date(),
			...msg(building, section, 26),
		})
		acc._alarm = true
	}
}

module.exports = alrClosed

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */
