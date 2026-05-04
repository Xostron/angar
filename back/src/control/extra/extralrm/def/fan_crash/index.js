const { msgF } = require('@tool/message')
const { getSignalFan } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Авария вентилятора (выключен автомат. выключатель)
function fanCrash(bld, sect, obj, s, se, m, automode, acc, data) {
	if (!m?.fanS?.length) return
	const sumAlarm = []
	for (const f of m.fanSAll) {
		acc[f._id] ??= {}
		const sig = getSignalFan(f?._id, obj)
		const moduleId = obj?.data?.signal
			?.filter((el) => el.type === 'fan' && el?.owner?.id === f._id)
			?.map((el) => el?.module?.id)
		// Сброс
		if (!sig) {
			delExtralrm(bld._id, sect._id, 'fanCrash' + f._id)
			acc[f._id]._alarm = false
		}
		// Установка
		if (sig && !acc[f._id].alarm) {
			wrExtralrm(bld._id, sect._id, 'fanCrash' + f._id, msgF(bld, sect, f.name, 35), [
				moduleId,
			])
			acc[f._id]._alarm = true
		}
		sumAlarm.push(acc?.[f._id]?._alarm)
	}
	// Если все вентиляторы секции в аварии, то авария секции
	const alarm = sumAlarm.every((el) => !!el)

	return alarm
}

module.exports = fanCrash
