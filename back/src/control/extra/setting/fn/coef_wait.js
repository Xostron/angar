const { data: store } = require('@store')
/**
 * @description Настройки влажности: Гистерезис абсолютной влажности в зависимости от температуры продукта
 * @param {object} stg настройки влажности
 * @param {object} bld склад
 * @param {object} obj глобальные данные
 * @returns {number} абс влажность
 */
function coefWait(stg, bld, obj) {
	const { value, data } = obj
	// Куча для отслеживания гистерезисов
	store.heap[bld._id] ??= {}
	const heap = store.heap[bld._id]
	heap.co2 ??= {}
	// Влажность продукта и гистерезис
	const tprd = value?.total?.[bld._id]?.tprd?.min
	const hyst = .3

	// Значение давления по-умолчанию
	let wait = stg?.wait3
	// от большего к меньшему
	// *************************** 
	if (tprd < stg?.wait2?.t || heap.co2.t2) {
		heap.co2.t2 = true
		wait = stg?.wait2
	}
	if (heap.co2.t2 && tprd - hyst > stg?.wait2?.t) {
		heap.co2.t2 = false
		wait = stg?.wait3
	}

	// ***************************
	if (tprd < stg?.wait1?.t || heap.co2.t1) {
		heap.co2.t1 = true
		wait = stg?.wait1
	}
	if (heap.co2.t1 && tprd - hyst > stg?.wait1?.p) {
		heap.co2.t1 = false
		wait = stg?.wait2
	}

	// console.log(3333, 'Коэффициенты давления', 'hin', hin, '< X;', 'Работа по давление: pressure', pressure)
	return wait
}

module.exports = coefWait
