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
 * Состояние конкретного испарителя
 * @param {*} clr
 * @param {*} obj
 * @returns
 */
function getStateClr2(clr, obj) {
	return obj?.value?.[clr._id]?.state
}

/**
 * Испаритель: ВНО выведены из работы или в аварии
 * @param {*} pair
 * @param {*} mS
 * @param {*} value
 * @returns true - вно испарителя не рабочие
 */
function isOffPair(pair, mS, value) {
	const r = pair.filter((idClr) => {
		const fans = mS.coolerS.find((el) => el._id === idClr)?.fan

		return fans.some((fan) => value[fan._id].state != 'alarm' && value[fan._id].state != 'off')
	})
	// Пустой массив испарителей - значит его ВНО не рабочие
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

module.exports = { getStateVNOClr, getStateClr, isOffPair, fansOff, getStateClr2 }
