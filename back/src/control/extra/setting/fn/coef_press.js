const { data: store } = require('@store')
const getSubmode = require('@tool/submode')
/**
 * @description Настройки влажности: Гистерезис абсолютной влажности в зависимости от температуры продукта
 * @param {object} stg настройки влажности
 * @param {object} bld склад
 * @param {object} obj глобальные данные
 * @returns {number} абс влажность
 */
function coefPress(stg, bld, obj) {
	const { value, data, retain } = obj

	// Влажность продукта
	const hin = value?.total?.[bld._id]?.hin?.max
	// Гистерезис давления
	const hyst = stg?.hysteresisP ?? 10
	// Режим склада
	const am = retain?.[bld._id]?.automode
	// Подрежим склада
	const submode = getSubmode(bld, retain)

	// По-умолчанию классические настройки гистерезисов давления
	let pressure = fnClassic(stg, bld, hin, hyst)
	// Режим сушка, хранение(лечение) -> максимальные настройки
	if (am === 'drying' || submode?.[0] === 'cure') pressure = { p: stg?.maxp ?? 201 }

	console.log(
		3333,
		'Коэффициенты давления',
		'hin',
		hin,
		'< X;',
		'Работа по давление: pressure',
		pressure,
		submode,
	)
	return pressure
}

module.exports = coefPress

/**
 * Зависимость давления от влажности продукта hyst = 10%
 * 1. 10% 100Па: 	Установка: датчик влажности продукта 0..50+hyst
 * 					Сброс гистерезис: датчик влажности продукта при 50%
 *
 * 2. 50% 200Па:	Установка: датчик влажности продукта 50+hyst..80+hyst
 * 					Сброс гистерезис: датчик влажности продукта при 80%
 *
 * 3. 80% 300Па: 	Установка: датчик влажности продукта = 80+hyst..+100
 * 					Сброс гистерезис: датчик влажности продукта при 80%
 */
function fnClassic(stg, bld, hin, hyst) {
	// Аккумулятор для отслеживания гистерезисов
	store.heap[bld._id] ??= {}
	const heap = store.heap[bld._id]
	heap.press ??= {}

	// Тип 3: Значение давления по-умолчанию
	let pressure = stg?.pressure3
	// Тип 2
	if (hin < stg?.pressure3?.h || heap.press.p2) {
		heap.press.p2 = true
		pressure = stg?.pressure2
	}
	if (heap.press.p2 && hin - hyst >= stg?.pressure3?.h) {
		heap.press.p2 = false
		pressure = stg?.pressure3
	}
	// Тип 1
	if (hin < stg?.pressure2?.h || heap.press.p1) {
		heap.press.p1 = true
		pressure = stg?.pressure1
	}
	if (heap.press.p1 && hin - hyst >= stg?.pressure2?.h) {
		heap.press.p1 = false
		pressure = stg?.pressure2
	}

	return pressure
}


