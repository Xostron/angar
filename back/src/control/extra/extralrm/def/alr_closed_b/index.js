const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgB } = require('@tool/message')


// Аварийное закрытие клапанов - по низкой температуре (склад)
function alrClosedB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(building?._id, obj, 'low')
	// Сброс
	if (!sig || isReset(building._id)) {
		delExtralrm(building._id, null, 'alrClosed')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		wrExtralrm(building._id, null, 'alrClosed', { date: new Date(), ...msgB(building, 26) })
		acc.alarm = true
	}
	return acc.alarm ?? null
}

module.exports = alrClosedB

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */

