const { getClr } = require('@tool/command/mech/fn')

/**
 * Получить Агрегированное состояние что ВНО испарителей секций включены
 * @param {*} bld Склад
 * @param {*} idS ИД секции
 * @param {*} obj Глобальные данные
 * @return true - ВНО испарителя включены
 */
function getStateVNOClr(idS, obj) {
	const coolerS = getClr(obj.data, idS)
	// Агрегированное состояние испарителей секций
	const state = coolerS.some((clr) => {
		const stateClr = obj?.value?.[clr._id]?.state
		return stateClr === 'off-on-off' || stateClr === 'on-on-off'
	})
	return state
}

/**
 * Получить Агрегированное состояние что ВНО испарителей секций включены
 * @param {*} bld Склад
 * @param {*} idS ИД секции
 * @param {*} obj Глобальные данные
 * @return {object[]} - Состояние испарителей секции, например, [off-off-off, on-off-off]
 */
function getStateClr(idS, obj) {
	const coolerS = getClr(obj.data, idS)
	// Агрегированное состояние испарителей секций
	return coolerS.map((clr) => obj?.value?.[clr._id]?.state)
}

module.exports = { getStateVNOClr, getStateClr }
