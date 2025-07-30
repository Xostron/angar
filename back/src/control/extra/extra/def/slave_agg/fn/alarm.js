const { msgBeep } = require('@tool/message')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { isReset } = require('@tool/reset')

/**
 * Основные аварии компрессоров агрегата
 * @param {object} Агрегат
 * @param {object} cmpr элемент compressorList
 * @param {object[]} beep рама сигналов данного компрессора
 * @param {object} state мясо сигналов
 * @param {object} acc acc
 * @returns {boolean} true - авария, false - нет аварии
 */
function fnAlarm(agg, cmpr, beep, state, acc) {
	// Создание аварийных сообщений
	acc[cmpr._id] ??= {}
	beep.forEach((el) => {
		if (el.code == 'run') return
		const be = state[el.code]?.value
		const owner = agg._id + ' ' + cmpr._id
		// Сброс аварии
		if (!be && isReset(agg.buildingId)) {
			delExtralrm(agg.buildingId, null, el.code)
			acc[cmpr._id][el.code] = false
		}
		// Установить аварию
		if (be && !acc[cmpr._id][el.code]) {
			const name = `Агрегат №${agg?.order}. Компрессор №${cmpr?.order}`
			wrExtralrm(agg.buildingId, owner, el.code, msgBeep({ _id: agg.buildingId }, el, name))
			acc[cmpr._id][el.code] = true
		}
	})
	// Авария низкого уровня масла
	const oilD = beep.find((el) => el.code == 'oil')
	oilAlarm(agg, cmpr, oilD, state.oil, acc)
}

const { compareTime } = require('@tool/command/time')

/**
 * Авария низкого уровня масла (наблюдается во время работы компрессора)
 * @param {*} permission Разрешение - агрегат в работе
 * @param {*} oil Аварийный сигнал
 * @param {*} acc Аккумулятор
 */
function oilAlarm(agg, cmpr, oil, stateOil, acc) {
	if (!oil) return
	if (acc[cmpr._id].running) {
		if (!acc.date) acc.date = new Date()
		// Установка аварии
		if (compareTime(acc.date, 60) && stateOil.value) {
			const owner = agg._id + ' ' + cmpr._id
			const name = `Агрегат №${agg?.order}. Компрессор №${cmpr?.order}`
			wrExtralrm(agg.buildingId, owner, 'oil', msgBeep({ _id: agg.buildingId }, oil, name))
			acc[cmpr._id][oil.code] = true
		}
	} else {
		acc.date = undefined
	}

	// Сброс аварии
	if (!stateOil.value && isReset(agg.buildingId)) {
		delExtralrm(agg.buildingId, null, oil.code)
		acc[cmpr._id][oil.code] = false
	}
	return acc[cmpr._id][oil.code]
}

module.exports = { fnAlarm }
