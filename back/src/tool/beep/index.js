const { data: store, wrExtralrm, delExtralrm } = require('@store')
const { msgBeep } = require('@tool/message')

// beep Устройств
function beepD(devc, arr, obj, building, acc, codeMsg) {
	acc.beep ??= {}
	// По beep устройства (аварийные beep)
	arr.filter((el) => el?.alarm)?.forEach((el) => {
		// Значение beep
		const be = obj?.value?.[devc._id]?.beep?.[el.code]?.value
		const name = `CO2 №${devc?.order}`
		// Сбросить аварию
		if (!be) {
			delExtralrm(building._id, devc._id, el.code)
			acc.beep[el.code] = false
		}
		// Установить аварию
		if (be && !acc.beep[el.code]) {
			wrExtralrm(building._id, devc._id, el.code, {
				date: new Date(),
				...msgBeep(building, el, name),
			})
			acc.beep[el.code] = true
		}
	})
}

// beep Компрессоров агрегата
function beepA(agg, cl, arr, obj, building, acc, codeMsg) {
	acc.beep ??= {}
	acc.beep[cl._id] ??= {}

	// По beep устройства (аварийные beep)
	arr.filter((el) => el?.alarm)?.forEach((el) => {
		// Значение beep
		const be = obj.value?.[agg._id]?.compressor?.[cl._id]?.beep?.[el.code]?.value
		// Владелец аварии
		const owner = agg._id + ' ' + cl._id
		// Сбросить аварию
		if (!be) {
			delExtralrm(building._id, owner, el.code)
			acc.beep[cl._id][el.code] = false
		}
		// Установить аварию
		if (be && !acc.beep[cl._id][el.code]) {
			const name = `Агрегат №${agg?.order}. Компрессор №${cl?.order}`
			wrExtralrm(building._id, owner, el.code, { date: new Date(), ...msgBeep(building, el, name) })
			acc.beep[cl._id][el.code] = true
		}
	})
}

module.exports = { beepD, beepA }
