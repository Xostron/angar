const { getSignalFan } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgF } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Авария вентилятора (выключен автомат. выключатель)
function fanCrash(building, section, obj, s, se, m, automode, acc, data) {
	if (!m?.fanS?.length) return
	const sumAlarm = []

	for (const f of m.fanS) {
		acc[f._id] ??= {}
		const sig = getSignalFan(f?._id, obj)
		const o = { bldId: building._id, secId: section._id, code: 'fanCrash' + f._id }
		// Сброс
		if (!sig || isReset(building._id)) {
			delExtralrm(building._id, section._id, 'fanCrash' + f._id)
			removeAcc(obj.acc, o, 'extralrm')
			acc[f._id].alarm = false
		}
		// Установка
		if (sig && !acc[f._id].alarm) {
			const mes = { date: new Date(), ...msgF(building, section, f.name, 35) }
			wrExtralrm(building._id, section._id, 'fanCrash' + f._id, mes)
			writeAcc(obj.acc, { ...o, mes }, 'extralrm')
			acc[f._id].alarm = true
		}
		sumAlarm.push(acc?.[f._id]?.alarm)
	}
	// Если все вентиляторы секции в аварии, то авария секции
	const alarm = sumAlarm.every((el) => !!el)
	return alarm
}

module.exports = fanCrash
