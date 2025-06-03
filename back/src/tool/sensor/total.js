const { getS, getSA } = require('@tool/get/sensor')

// мин, макс, состояние по датчикам
function state(sensor, result, flt, fltA) {
	// Значения группы датчиков
	let values = getS(sensor, result, flt)

	let on = getSA(sensor, result, fltA).some((el) => el === 'on')
	let off = getSA(sensor, result, fltA).some((el) => el === 'off')

	const stt = off ? 'off' : 'alarm'
	const st = on ? 'on' : stt

	// Нет аварий
	if (values?.length) return { state: st, max: Math.max(...values), min: Math.min(...values) }
	return { state: stt, max: null, min: null }
}
function fnState(sensor, result, idB, type) {
	const flt = (el) => el.owner.id === idB && el.type === type && result?.[el._id]?.state === 'on'
	const fltA = (el) => el.owner.id === idB && el.type === type
	return state(sensor, result, flt, fltA)
}

/**
 * @description Замена датчика улицы на прогноз погоды
 * @param {number} tout min температура улицы по датчику
 * @param {object} tw температура улицы по прогнозу
 * @returns {number} температура улицы min
 */
function toutVsWeather(tout, tw) {
	// Прогноз погоды выкл или не валиден
	if (tw.state != 'on') return tout
	// Условие переключения температуры на прогноз погоды если датчик рабочий
	if (tout !== null && tout > 0 && tout > tw.value && tw.value < 1) return tw.value
	// Если датчик температуры не рабочий
	if (tout === null || tout === undefined) return tw.value
	// по-умолчанию: работа по датчику
	return tout
}

module.exports = {state, fnState, toutVsWeather}