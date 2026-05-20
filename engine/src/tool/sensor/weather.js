const { isValidWeather } = require('./fn')

/**
 * Состояние параметра прогноза погоды
 * @param {string} bId id склада
 * @param {object} weather данные прогноза погоды
 * @param {object} retain сохраненные данные склада из json
 * @param {string} key temp | humidity
 * @return {object} {value:1, state: 'on' | 'off'}
 */
function stateWeather(bId, weather, retain, key, fld) {
	// Состояние: вкл/выкл на экране датчиков (on|off)
	let state =
		retain?.[bId]?.[key]?.on === undefined || retain?.[bId]?.[key]?.on === true ? 'on' : 'off'
	// Авария - alarm
	// Если нет показания или времени обновления
	if (typeof weather?.[fld] != 'number') state = 'alarm'
	// Проверка последнего обновления (срок 2 часа)
	state = isValidWeather(weather) ? state : 'alarm'
	// Истинное значение
	// const raw = state == 'alarm' ? null : +weather?.[fld].toFixed(1)
	const raw = +weather?.[fld]?.toFixed(1)
	// Значение с коррекцией
	const value =
		typeof raw == 'number' ? +(raw + (+retain?.[bId]?.[key]?.corr || 0)).toFixed(1) : null
	return { raw, value, state }
}

module.exports = stateWeather
