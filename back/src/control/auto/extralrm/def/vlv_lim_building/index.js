const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgB } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Нет питания концевиков клапана (склад)
function vlvLimB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал от реле безопасности данной секции
	const sig = getSignal(building?._id, obj, 'vlvLim')
	const o = { bldId: building._id, code: 'vlvLim' }
	// Сброс
	if (!sig || isReset(building._id)) {
		delExtralrm(building._id, null, 'vlvLim')
		removeAcc(obj.acc, o, 'extralrm')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		const mes = { date: new Date(), ...msgB(building, 33) }
		wrExtralrm(building._id, null, 'vlvLim', mes)
		writeAcc(obj.acc, { ...o, mes }, 'extralrm')
		acc.alarm = true
	}
}

module.exports = vlvLimB
