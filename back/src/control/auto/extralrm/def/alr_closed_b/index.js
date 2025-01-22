const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgB } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Аварийное закрытие клапанов - по низкой температуре (склад)
function alrClosedB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(building?._id, obj, 'low')
	const o = { bldId: building._id, code: 'low' }
	// Сброс
	if (!sig || isReset(building._id)) {
		delExtralrm(building._id, null, 'alrClosed')
		removeAcc(obj.acc, o, 'extralrm')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		const mes = { date: new Date(), ...msgB(building, 26) }
		wrExtralrm(building._id, null, 'alrClosed', mes)
		writeAcc(obj.acc, { ...o, mes }, 'extralrm')
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
