const { data: store } = require('@store')
/**
 * @description Настройки влажности: Гистерезис абсолютной влажности в зависимости от температуры продукта
 * @param {object} stg настройки влажности
 * @param {object} bld склад
 * @param {object} obj глобальные данные
 * @returns {number} абс влажность
 */
function coefPress(stg, bld, obj) {
	const { value, data } = obj
	// Куча для отслеживания гистерезисов
	store.heap[bld._id] ??= {}
	const heap = store.heap[bld._id]
	heap.press ??= {}
	// Влажность продукта и гистерезис
	const hin = value?.total?.[bld._id]?.hin?.max
	const hyst = 5

	// Значение давления по-умолчанию
	let pressure = stg?.pressure3
	// от большего к меньшему
	// ***************************
	if (hin < stg?.pressure2?.h || heap.press.p2) {
		heap.press.p2 = true
		pressure = stg?.pressure2
	}
	if (heap.press.p2 && hin - hyst > stg?.pressure2?.h) {
		heap.press.p2 = false
		pressure = stg?.pressure3
	}

	// ***************************
	if (hin < stg?.pressure1?.h || heap.press.pressure1) {
		heap.press.pressure1 = true
		pressure = stg?.pressure1
	}
	if (heap.press.pressure1 && hin - hyst > stg?.pressure1?.p) {
		heap.press.pressure1 = false
		pressure = stg?.pressure2
	}

	console.log(3333, 'Коэффициенты давления', 'hin', hin, '< X;', 'Работа по давление: pressure', pressure)
	return pressure
}

module.exports = coefPress

/**
 * Зависимость давления от влажности продукта
 * 1. 20% 100Па: 	Установка: датчик влажности продукта = 0..19,9% < 20%
 * 					Сброс гистерезис: датчик влажности продукта - 5% > 20%
 *
 * 2. 60% 200Па:	Установка: датчик влажности продукта = 20..59,9% < 60%
 * 					Сброс гистерезис: датчик влажности продукта - 5% > 60%
 *
 * 3. 80% 300Па: 	Установка: датчик влажности продукта = 59,9..100%
 * 					Сброс гистерезис: датчик влажности продукта - 5% > 80%
 */

/**
 * Зависимость давления от влажности продукта
 * 1. 20% 100Па: 	Установка: датчик влажности продукта = 0..19,9% < 20%
 *
 * 2. 60% 200Па:	Установка: датчик влажности продукта = 20..59,9% < 60%
 *
 * 3. 80% 300Па: 	Установка: датчик влажности продукта = 59,9..100%
 */