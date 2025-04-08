const { data: store } = require('@store')
/**
 * @description Настройки влажности: Гистерезис абсолютной влажности в зависимости от температуры продукта
 * @param {object} stg настройки влажности
 * @param {object} bld склад
 * @param {object} obj глобальные данные
 * @returns {number} абс влажность
 */
function coefMois(stg, bld, obj) {
	const { value, data } = obj
	store.heap[bld._id] ??= {}
	const heap = store.heap[bld._id]
	heap.mois ??= {}
	// Температура продукта и гистерезис
	const tprd = value?.total?.[bld._id]?.tprd?.min
	const hyst = 0.2

	let habs = stg?.abs3?.h
	// от большего к меньшему
	// ***************************
	if (tprd < stg?.abs2?.t || heap.mois.abs2) {
		heap.mois.abs2 = true
		habs = stg?.abs2?.h
	}
	if (heap.mois.abs2 && tprd - hyst > stg?.abs2?.t) {
		heap.mois.abs2 = false
		habs = stg?.abs3?.h
	}

	// ***************************
	if (tprd < stg?.abs1?.t || heap.mois.abs1) {
		heap.mois.abs1 = true
		habs = stg?.abs1?.h
	}
	if (heap.mois.abs1 && tprd - hyst > stg?.abs1?.t) {
		heap.mois.abs1 = false
		habs = stg?.abs2?.h
	}

	// console.log(3333, 'Коэффициенты влажности', 'tprd', tprd, '< X;', 'Влажность: habs', habs)
	return habs
}

module.exports = coefMois