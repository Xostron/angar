const { getSignalFan } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgF } = require('@tool/message')
const mes = require('@dict/message')

// Авария вентилятора (выключен автомат. выключатель)
function fanCrash(building, section, obj, s, se, m, automode, acc, data) {
	// console.log(obj.value)
	// console.log(11111, '65d73cda52921647f4994d5a')
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
			wrExtralrm(building._id, section._id, 'fanCrash' + f._id, {
				date: new Date(),
				...msgF(building, section, f.name, 35),
			})
			acc[f._id].alarm = true
		}
		sumAlarm.push(acc?.[f._id]?.alarm)
	}
	// Если все вентиляторы секции в аварии, то авария секции
	const alarm = sumAlarm.every((el) => !!el)
	return alarm
}

module.exports = fanCrash