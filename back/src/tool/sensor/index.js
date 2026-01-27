const { data: store } = require('@store')
const { getBS } = require('@tool/get/building')
const { debounce } = require('./debounce')
const { getRaw, range, webSensAlarm, state, isValidWeather } = require('./fn')
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
		//
		result[s._id] = fnHinHout(owner?.building?._id, s, result[s._id], retain)
		// Аварийные сообщения датчика
		webSensAlarm(result[s._id], owner?.building, owner?.section, s)
		// Обновляем прошлое значение
		store.holdSensor[s._id] = result?.[s._id]
	}
	// Добавление прогноза погоды на экран настроек датчиков
	for (const bld of building) {
		result[bld._id] ??= {}
		result[bld._id].tweather = stateWeather(bld._id, weather, retain, 'tweather', 'temp')
		result[bld._id].hweather = stateWeather(bld._id, weather, retain, 'hweather', 'humidity')
	}
}

/**
 * Анализ датчика и настройка
 * @param {object} sens Рама датчика
 * @param {object} val Значения модуля
 * @param {object} equip Оборудование
 * @param {object} retain Сохраненные пользовательские данные
 * @returns {object} {raw, value, state}
 */
function valid(sens, val, equip, retain) {
	// Владельцы датчика (склад и секция)
	const { building, section } = getBS(sens, equip)
	if (!building) return
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
	let r = { raw, value, state: state(raw, on) }

	// Проверка диапазонов
	range(r, sens)
	return r
}

/**
 *
 * @param {*} sens Рама датчика
 * @param {*} r Показание и состояние датчика
 */
function fnHinHout(idB, sens, r, retain) {
	const on = retain?.[idB._id]?.[sens._id]?.on ?? true
	// Если Датчик влажности улицы/продукта = null (авария датчика)
	// превращаем его => в 100%, и показываем только состояния off|on
	if (['hout', 'hin'].includes(sens.type)) console.log(2200, sens.type, r)
	// Датчики влажности продукта/улицы
	if (['hout', 'hin'].includes(sens.type) && r.raw === null) {
		return {
			raw: 100,
			value: 100,
			state: state(r.raw, on) === 'alarm' ? 'on' : state(r.raw, on),
		}
	}
	// Все остальные датчики
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

module.exports = vSensor
