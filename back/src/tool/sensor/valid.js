const tSens = require('@dict/sensor')
const { state } = require('./fn')

/**
 * Анализ датчика и настройка
 * @param {object} sens Рама датчика
 * @param {object} val Значения модуля
 * @param {object} equip Оборудование
 * @param {object} retain Сохраненные пользовательские данные
 * @returns {object} {raw, value, state}
 */
function valid(sens, owner, val, equip, retain) {
	// Владельцы датчика (склад и секция)
	const { building, section } = owner
	if (!building) return
	// Настройки датчика: on - вкл датчик, corr - коррекция
	const corr = retain?.[building._id]?.[sens._id]?.corr ?? 0
	const on = retain?.[building._id]?.[sens._id]?.on ?? true

	// Истинное значение датчика
	let v = val?.[sens?.module?.id]?.[sens.module?.channel - 1] ?? null

	// Для датчика из binding (type='ai')
	if (sens?.moduleId && sens?.channel) {
		v = val?.[sens?.moduleId]?.[sens?.channel - 1] ?? null
	}

	// Округленное истинное значение
	let raw = getRaw(sens, v)
	const code = sens?.type === ' ai' ? 'ai' : 'default'
	raw = check[code](sens, raw, val)

	// Значение датчика с коррекцией (используется в алгоритмах)
	const value = raw !== null ? +(raw + +corr).toFixed(sens?.accuracy || 1) : null
	let r = { raw, value, state: state(raw, on) }
	// Проверка диапазонов
	range(r, sens)
	return r
}

// Проверка сырых показаний (raw) датчика
const check = {
	default(sens, raw, val) {
		// Авария датчика (+ авария по антидребезгу находится в tool/debounce_sensor)
		if (String(raw).length > 8) raw = null
		// Модуль в ошибке
		if (val?.[sens?.module?.id]?.error) raw = null
		// isNaN
		if (isNaN(raw)) raw = null
		return raw
	},
	ai(sens, raw, val) {
		// Авария датчика (+ авария по антидребезгу находится в tool/debounce_sensor)
		if (String(raw).length > 8) raw = 0
		// Модуль в ошибке
		if (val?.[sens?.moduleId]?.error) raw = null
		// isNaN
		if (isNaN(raw)) raw = 0
		return raw
	},
}

// Округленное истинное значение
function getRaw(sens, v) {
	// Датчик не объявлен в админке
	if (!sens?.module?.id && !sens?.moduleId) return null
	if (typeof sens?.module?.channel !== 'number' && typeof sens?.channel !== 'number') return null

	return +v?.toFixed(sens?.accuracy || 1) ?? null
}

// Проверка диапазонов датчика
function range(r, sens) {
	switch (true) {
		// Температура
		case tSens.temp.includes(sens.type):
			if (r.value > 99) r.value = 99.0
			if (r.value < -99) r.value = -99.0
			break
		// Датчик влажности продукта (при выводе из работы = 80%)
		// Влажность улицы
		case sens.type === 'hin':
		case tSens.mois.includes(sens.type):
			if (r.value > 99.8) r.value = 99.8
			if (r.value < 0) r.value = 0.0
			if (r.state === 'off') r.value = 85
			if (r.state === 'alarm') ((r.value = 100), (r.state = 'on'))
			break
		// Токи двигателя
		case sens.type === 'ai':
			r.value = r.value < 0 ? 0 : r.value
			break
		// Давление
		case tSens.pres.includes(sens.type):
			if (r.value > 2000) r.value = 2000.0
			if (r.value < -2000) r.value = -2000.0
			break
		default:
			break
	}
}

module.exports = valid
