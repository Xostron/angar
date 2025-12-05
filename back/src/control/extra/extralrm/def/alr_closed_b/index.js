const { msgB } = require('@tool/message')
const { getSumSig } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Аварийное закрытие клапанов - по низкой температуре (склад)
function alrClosedB(bld, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	// const sig = getSignal(bld?._id, obj, 'low')
	const sig = getSumSig(bld._id, obj?.data?.section, obj, 'low')

	// Сброс
	if (!sig) {
		delExtralrm(bld._id, null, 'alrClosed')
		acc._alarm = false
	}
	// Установка
	if (sig && !acc._alarm) {
		wrExtralrm(bld._id, null, 'alrClosed', msgB(bld, 26))
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

