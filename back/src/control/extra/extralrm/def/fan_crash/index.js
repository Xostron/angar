const { msgF } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignalFan } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Авария вентилятора (выключен автомат. выключатель)
function fanCrash(building, section, obj, s, se, m, automode, acc, data) {
	if (!m?.fanS?.length) return
	const sumAlarm = []

	for (const f of m.fanS) {
		acc[f._id] ??= {}
		const sig = getSignalFan(f?._id, obj)
		// Сброс
		if (!sig || isReset(building._id)) {
			delExtralrm(building._id, section._id, 'fanCrash' + f._id)
			acc[f._id].alarm = false
		}
		// Установка
		if (sig && !acc[f._id].alarm) {
			wrExtralrm(building._id, section._id, 'fanCrash' + f._id, msgF(building, section, f.name, 35))
			acc[f._id].alarm = true
		}
		sumAlarm.push(acc?.[f._id]?.alarm)
	}
	// Если все вентиляторы секции в аварии, то авария секции
	const alarm = sumAlarm.every((el) => !!el)
	return alarm
}

module.exports = fanCrash
