const { data: store } = require('@store')
const { getBS } = require('@tool/get/building')
const debounce = require('./debounce')
const { getRaw, range, webAlarm, state } = require('./fn')
/**
 * Анализ датчиков
 * result[s._id] - отображение на экране настроек датчиков,
 * result.total - значения датчиков для расчетов алгоритма и отображения на мнемосхемах
 * @param {object} equip конфигурация склада json
 * @param {object} val сырые данные с опроса модулей
 * @param {object} retain сохраненные настройки склада
 * @param {object} result Результат
 */
function vSensor(equip, val, retain, result) {
	const { sensor, building, weather } = equip
	for (const s of sensor) {
		// Владелец датчика
		const owner = getBS(s, equip)
		// Исправность, округление датчика
		const r = valid(s, val, equip, retain)
		// антидребезг датчика
		const hold = debounce(owner?.building?._id, s._id, r, store.holdSensor?.[s._id], retain, s)
		result[s._id] = hold ? hold : r
		store.holdSensor[s._id] = result?.[s._id]
	}
	// Добавление прогноза погоды на экран настроек датчиков
	for (const bld of building) {
		result[bld._id] ??= {}
		result[bld._id].tweather = stateWeather(bld._id, weather, retain, 'temp')
		result[bld._id].hweather = stateWeather(bld._id, weather, retain, 'humidity')
	}
}

/**
 * Анализ датчика и настройка
 * @param {object[]} sens
 * @param {object} val
 * @param {object} equip
 * @param {object} retain
 * @returns {object} {raw, value, state}
 */
function valid(sens, val, equip, retain) {
	// Владельцы датчика (склад и секция)
	const { building, section } = getBS(sens, equip)
	// Настройки датчика: on - вкл датчик, corr - коррекция
	const corr = retain?.[building._id]?.[sens._id]?.corr ?? 0
	const on = retain?.[building._id]?.[sens._id]?.on ?? true
	// Истинное значение датчика
	const v = val?.[sens?.module?.id]?.[sens.module?.channel - 1] ?? null
	// Округленное истинное значение
	let raw = getRaw(sens, v)

	// Авария датчика (+ авария по антидребезгу находится в tool/debounce_sensor)
	if (String(raw).length > 8) raw = null
	// Модуль в ошибке
	if (val?.[sens?.module?.id]?.error) raw = null
	// isNaN
	if (isNaN(raw)) raw = null

	// Значение датчика с коррекцией (используется в алгоритмах)
	const value = raw !== null ? +(raw + +corr).toFixed(sens?.accuracy || 1) : null
	const r = { raw, value, state: state(raw, on) }

	// Проверка диапазонов
	range(r, sens)

	// Аварийные сообщения датчика
	webAlarm(r, building, section, sens)
	return r
}

/**
 * Состояние параметра прогноза погоды
 * @param {string} bId id склада
 * @param {object} weather данные прогноза погоды
 * @param {object} retain сохраненные данные склада из json
 * @param {string} key temp | humidity
 * @return {object} {value:1, state: 'on' | 'off'}
 */
function stateWeather(bId, weather, retain, key) {
	// Состояние: вкл/выкл на экране датчиков
	let state = !retain?.[bId]?.weather?.[key]?.on || retain?.[bId]?.weather?.[key]?.on === true ? 'on' : 'off'
	// Если данные о параметре нет, то alarm
	state = typeof weather?.[key] == 'number' ? state : 'alarm'
	// Истинное значение
	const raw = state != 'alarm' ? +weather?.[key].toFixed(1) : null
	// Значение с коррекцией
	const value = typeof raw == 'number' ? +(raw + (retain?.[bId]?.weather?.[key]?.corr || 0)).toFixed(1) : null
	return { raw, value, state }
}

module.exports =  vSensor 
