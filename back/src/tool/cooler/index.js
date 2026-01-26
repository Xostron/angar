const { getClr } = require('@tool/command/mech/fn')

/**
 * Получить Агрегированное состояние испарителей секций
 * @param {*} bld Склад
 * @param {*} idS ИД секции
 * @param {*} obj Глобальные данные
 */
function getStateClr(bld, idS, obj) {
	const coolerS = getClr(obj.data, idS)
	// Агрегированное состояние испарителей секций
	const state = coolerS.some((clr) => {
		const stateClr = obj?.value?.[clr._id]?.state
		return stateClr === 'off-on-off' || stateClr === 'on-on-off'
	})
	return state
}

module.exports = { getStateClr }
