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
	let pressure = stg?.pressure3?.p
	// от большего к меньшему
	// *************************** 
	if (hin < stg?.pressure2?.h || heap.press.p2) {
		heap.press.p2 = true
		pressure = stg?.pressure2?.p
	}
	if (heap.press.p2 && hin - hyst > stg?.pressure2?.h) {
		heap.press.p2 = false
		pressure = stg?.pressure3?.p
	}

	// ***************************
	if (hin < stg?.pressure1?.h || heap.press.pressure1) {
		heap.press.pressure1 = true
		pressure = stg?.pressure1?.p
	}
	if (heap.press.pressure1 && hin - hyst > stg?.pressure1?.p) {
		heap.press.pressure1 = false
		pressure = stg?.pressure2?.p
	}

	// console.log(3333, 'Коэффициенты давления', 'hin', hin, '< X;', 'Работа по давление: pressure', pressure)
	return pressure
}

module.exports = coefPress
