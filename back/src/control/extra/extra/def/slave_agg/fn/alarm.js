const { msgBeep } = require('@tool/message')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
const delayOilAlarm = 60000
/**
 * Основные аварии компрессоров агрегата
 * @param {object} agg Агрегат
 * @param {string} owner aggListId_compressorListId
 * @param {object} cmpr элемент compressorList
 * @param {object[]} beep рама сигналов данного компрессора
 * @param {object} state мясо сигналов
 * @param {object} acc acc
 * @returns {boolean} true - авария, false - нет аварии
 */
function fnAlarm(agg, owner, cmpr, beep, state, acc) {
	// Создание аварийных сообщений от beep компрессоров
	acc[owner] ??= {}
	beep.forEach((el) => {
		if (['oil', 'run'].includes(el.code)) return
		const be = state[el.code]?.value
		// Сброс аварийных сообщений от предупреждающих beep
		if (!el.alarm && !be) {
			delExtralrm(agg.buildingId, owner, el.code)
			acc[owner][el.code] = false
		}
		// Установить аварию
		if (be && !acc?.[owner]?.[el.code]) {
			const name = el.alarm
				? `Агрегат №${agg?.order}. Компрессор №${cmpr?.order}`
				: `Предупреждение: Агрегат №${agg?.order}. Компрессор №${cmpr?.order}`
			wrExtralrm(agg.buildingId, owner, el.code, msgBeep({ _id: agg.buildingId }, el, name))
		}
		acc[owner][el.code] = isExtralrm(agg.buildingId, owner, el.code)
	})
	// Авария низкого уровня масла
	const oilD = beep.find((el) => el.code === 'oil')
	oilAlarm(agg, owner, cmpr, oilD, state.oil, acc)
}

/**
 * Авария низкого уровня масла (наблюдается во время работы компрессора)
 * @param {*} permission Разрешение - агрегат в работе
 * @param {*} oil Аварийный сигнал
 * @param {*} acc Аккумулятор
 */
function oilAlarm(agg, owner, cmpr, oil, stateOil, acc) {
	if (!oil) return
	// Установка аварии
	if (acc[owner].run) {
		if (!acc[owner].date) acc[owner].date = new Date()
		if (compareTime(acc[owner].date, delayOilAlarm) && stateOil?.value) {
			const name = `Агрегат №${agg?.order}. Компрессор №${cmpr?.order}`
			wrExtralrm(agg.buildingId, owner, 'oil', msgBeep({ _id: agg.buildingId }, oil, name))
			// acc[owner].oil = true
		}
	} else {
		acc[owner].date = null
	}
	acc[owner].oil = isExtralrm(agg.buildingId, owner, 'oil')
}

module.exports = { fnAlarm }
