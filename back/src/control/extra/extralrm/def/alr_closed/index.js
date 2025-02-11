const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msg } = require('@tool/message')


// Аварийное закрытие клапанов - по низкой температуре
function alrClosed(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(section?._id, obj, 'low')
	// Сброс
	if (!sig || isReset(building._id)) {
		delExtralrm(building._id, section._id, 'alrClosed')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		wrExtralrm(building._id, section._id, 'alrClosed', { date: new Date(), ...msg(building, section, 26) })
		acc.alarm = true
	}
}

module.exports = alrClosed

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */

