const { data: store, wrExtralrm, delExtralrm } = require('@store')
const { msgBeep } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// beep Устройств
function beepD(devc, arr, obj, building, acc, codeMsg) {
	acc.beep ??= {}
	// По beep устройства (аварийные beep)
	arr.filter((el) => el?.alarm)?.forEach((el) => {
		// Значение beep
		const be = obj?.value?.[devc._id]?.beep?.[el.code]?.value
		const name = `CO2 №${devc?.order}`
		const o = { bldId: building._id, secId: devc._id, code: el.code }
		// Сбросить аварию
		if (!be) {
			delExtralrm(building._id, devc._id, el.code)
			removeAcc(obj.acc, o, 'extralrm')
			acc.beep[el.code] = false
		}
		// Установить аварию
		if (be && !acc.beep[el.code]) {
			const mes = {date: new Date(),...msgBeep(building, el, name)}
			wrExtralrm(building._id, devc._id, el.code, mes)
			writeAcc(obj.acc, { ...o, mes }, 'extralrm')
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
		const o = { bldId: building._id, secId: owner, code: el.code }
		// Сбросить аварию
		if (!be) {
			delExtralrm(building._id, owner, el.code)
			removeAcc(obj.acc, o, 'extralrm')
			acc.beep[cl._id][el.code] = false
		}
		// Установить аварию
		if (be && !acc.beep[cl._id][el.code]) {
			const name = `Агрегат №${agg?.order}. Компрессор №${cl?.order}`
			const mes = { date: new Date(), ...msgBeep(building, el, name) }
			wrExtralrm(building._id, owner, el.code, mes)
			writeAcc(obj.acc, { ...o, mes }, 'extralrm')
			acc.beep[cl._id][el.code] = true
		}
	})
}

module.exports = { beepD, beepA }
