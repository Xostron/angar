const { data: store } = require('@store')
/**
 * @description Настройки влажности: Гистерезис абсолютной влажности в зависимости от температуры продукта
 * @param {object} stg настройки влажности
 * @param {object} bld склад
 * @param {object} obj глобальные данные
 * @returns {number} абс влажность
 */
function coefHout(stg, bld, obj) {
	const { value, data } = obj

	store.heap[bld._id] ??= {}
	const heap = store.heap[bld._id]
	heap.moisHout ??= {}

	// Температура продукта и гистерезис
	const tout = value.total?.tout?.min
	const hyst = 0.2
	// console.log(tout, hyst)

	let hout = stg?.hout3
	// от большего к меньшему
	// ***************************
	if (tout < stg?.hout2?.t || heap.moisHout.hout2) {
		heap.moisHout.hout2 = true
		hout = stg?.hout2
	}
	if (heap.moisHout.hout2 && tout - hyst > stg?.hout2?.t) {
		heap.moisHout.hout2 = false
		hout = stg?.hout3
	}

	// ***************************
	if (tout < stg?.hout1?.t || heap.moisHout.hout1) {
		heap.moisHout.hout1 = true
		hout = stg?.hout1
	}
	if (heap.moisHout.hout1 && tout - hyst > stg?.hout1?.t) {
		heap.moisHout.hout1 = false
		hout = stg?.hout2
	}

	// console.log(3333, 'Коэффициенты влажности', 'tout', tout, '< X;', 'Влажность: hout', hout)
	return hout
}

module.exports = coefHout
