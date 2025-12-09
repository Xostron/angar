const { msgB } = require('@tool/message')
const { getSumSig, getSumSigBld } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Аварийное закрытие клапанов - по низкой температуре (склад)
function alrClosedB(bld, section, obj, s, se, m, automode, acc, data) {
	// Сигнал по складу и секциям
	// const sig = getSumSig(bld._id, obj?.data?.section, obj, 'low')
	// Сигнал только по складу
	const sigB = getSumSigBld(bld._id, obj, 'low')
	// Сброс
	if (!sigB) {
		delExtralrm(bld._id, null, 'alrClosed')
		acc._alarm = false
	}
	// Установка
	if (sigB && !acc._alarm) {
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
