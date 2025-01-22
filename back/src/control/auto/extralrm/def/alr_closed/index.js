const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msg } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Аварийное закрытие клапанов - по низкой температуре
function alrClosed(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(section?._id, obj, 'low')
	const o = { bldId: building._id, secId: section._id, code: 'low' }
	// Сброс
	if (!sig || isReset(building._id)) {
		delExtralrm(building._id, section._id, 'alrClosed')
		removeAcc(obj.acc, o, 'extralrm')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		const mes = { date: new Date(), ...msg(building, section, 26) }
		wrExtralrm(building._id, section._id, 'alrClosed', mes)
		writeAcc(obj.acc, { ...o, mes }, 'extralrm')
		acc.alarm = true
	}
}

module.exports = alrClosed

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */
