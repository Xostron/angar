const { data: store } = require('@store')
/**
 * @description Настройки CO2: в зависимости от температуры продукта
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
	const hyst = 0.3

	// Значение давления по-умолчанию
	let wait = stg?.wait3
	// от большего к меньшему
	// ***************************
	if (tprd < stg?.wait2?.t || heap.co2.t2) {
		heap.co2.t2 = true
		wait = stg?.wait2
		// console.log(1, tprd, '<', stg?.wait2?.t, '||', heap.co2.t2)
	}
	if (heap.co2.t2 && tprd - hyst > stg?.wait2?.t) {
		heap.co2.t2 = false
		wait = stg?.wait3
		// console.log(2, heap.co2.t2, '&&', tprd, '-', hyst, '>', stg?.wait2?.t)
	}

	// ***************************
	if (tprd < stg?.wait1?.t || heap.co2.t1) {
		heap.co2.t1 = true
		wait = stg?.wait1
		// console.log(3, tprd, '<', stg?.wait1?.t, '||', heap.co2.t1)
	}
	if (heap.co2.t1 && tprd - hyst > stg?.wait1?.t) {
		heap.co2.t1 = false
		wait = stg?.wait2
		// console.log(4, heap.co2.t1, '&&', tprd, '-', hyst, '>', stg?.wait1?.p)
	}

	// console.log(3333, 'Коэффициенты CO2', wait)
	return wait
}

module.exports = coefWait
