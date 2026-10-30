const { msgF } = require('@tool/message')
const { getSignalFan } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { fnOwner } = require('../deb_do/fn')

// Авария вентилятора (выключен автомат. выключатель)
function fanCrash(bld, sect, obj, s, se, m, automode, acc, data) {
	let _fan
	if (bld.type == 'cold') _fan = m?.fanAll ?? []
	else _fan = m?.fanSAll ?? []

	if (!_fan.length) return
	const sumAlarm = []
	for (const f of _fan) {
		acc[f._id] ??= {}
		// Значение сигнала "Автомат выбит"
		const sig = getSignalFan(f?._id, obj)
		const v = obj.value[f._id]
		const moduleId = obj?.data?.signal
			?.filter((el) => el.type === 'fan' && el?.owner?.id === f._id)
			?.map((el) => el?.module?.id)
		// Сброс
		if (!sig) {
			delExtralrm(bld._id, sect?._id ?? null, 'fanCrash' + f._id)
			acc[f._id]._alarm = false
		}
		// Установка
		if (sig && !acc[f._id].alarm) {
			const ownerName = fnOwner(f, obj)
			wrExtralrm(
				bld._id,
				sect?._id ?? null,
				'fanCrash' + f._id,
				msgF(bld, { name: ownerName }, f.name, 35, v?.codeFC),
				moduleId,
			)
			acc[f._id]._alarm = true
		}
		sumAlarm.push(acc?.[f._id]?._alarm)
	}
	// Если все вентиляторы секции в аварии, то авария секции
	const alarm = sumAlarm.every((el) => !!el)

	return alarm
}

module.exports = fanCrash
