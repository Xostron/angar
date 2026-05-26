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
 * Получить состояние испарителей секций (массив состояний)
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

/**
 * Несколько испарителей с одним общим ВНО: вся пара выведена из работы
 * @param {*} pair
 * @param {*} mS
 * @param {*} value
 * @returns
 */
function isOffPair(pair, mS, value) {
	const r = pair.filter((idClr) => {
		const fan = mS.coolerS.find((el) => el._id === idClr)?.fan?.[0]
		return value[fan._id].state != 'alarm' && value[fan._id].state !== 'off'
	})
	return !r.length
}

/**
 * ВНО испарителя выведен из работы
 * @param {*} idB
 * @param {*} clr
 * @param {*} retain
 * @returns
 */
function fansOff(idB, clr, retain) {
	return clr.fan.some((el) => retain?.[idB]?.fan?.[clr.sectionId]?.[el._id])
}

module.exports = { getStateVNOClr, getStateClr, isOffPair, fansOff }
