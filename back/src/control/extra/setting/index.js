const { getSensor } = require('@tool/command/sensor')
const { fill, cb } = require('./fn')
const { debugJson } = require('@tool/json')
const { data: store } = require('@store')

function setting(bld, obj) {
	const { retain, factory } = obj
	const codeP = retain?.[bld._id]?.product?.code
	console.log(999, 'Аккумулятор гистерезисов', store.heap)
	// список настроек склада
	const kind = bld?.kindList
	const r = {}
	// по настройкам склада
	for (const key of kind) {
		const isPrd = factory[key]?._prd
		fill(r, retain?.[bld._id]?.setting?.[key], factory?.[key], cb, key, codeP, isPrd)
	}
	// Системные настройки: Коэффициенты клапанов
	r.sys ??= {}
	r.sys.cf = coef(r.sys, bld, obj)
	// Настройки влажности: гистерезис абс. влажности
	r.mois ??= {}
	r.mois.hysteresisAbs = coefMois(r.mois, bld, obj)
	// Готовые настройки на сервере (для проверки)
	// debugJson({ newnew: r }, ph.resolve(__dirname))
	return r
}

module.exports = setting

/**
 * Системные настройки: коэффициенты клапанов
 * @param {object} stg Системные настройки
 * @param {object} bld склад
 * @param {object} obj глобальные данные
 * @returns {object}
 */
function coef(stg, bld, obj) {
	const { value, data } = obj
	// Температура улицы (мин)
	const tout = value?.total?.tout?.min
	// Температура продукта
	const tprd = value?.total?.[bld._id]?.tprd?.min
	const hyst = 1

	store.heap[bld._id] ??= {}
	const heap = store.heap[bld._id]
	heap.coef ??= {}

	// Выпускной клапан: Множитель открытия в %: %Out = %In(приточ. клап.) * kOut
	// от меньшего к большему
	let kOut = outOn(bld, stg, tout, tprd, hyst)

	// Приточный клапан: Множитель импульсов 5сек * kIn = 15сек откр/закр
	let kIn = 1
	if (tout >= 4 || heap.coef.onIn) {
		heap.coef.onIn = true
		kIn = 3
	}
	if (heap.coef.onIn && tout + hyst < 4) {
		heap.coef.onIn = false
		kIn = 1
	}

	console.log(5555, 'Коэффициенты клапана', 'tout', tout, '<', stg.outOn, { kOut, kIn })
	return { kOut, kIn }
}

// Работа по коэффициентам
function outOn(bld, stg, tout, tprd, hyst) {
	store.heap[bld._id] ??= {}
	const heap = store.heap[bld._id]
	heap.coef ??= {}

	let kOut = stg?.outDefault

	// подключение к коэффициентам
	if (tout < stg.outOn || heap.coef.onOut) {
		heap.coef.onOut = true
		// ***************************
		if (tout < tprd - stg?.out1?.temp || heap.coef.out1) {
			heap.coef.out1 = true
			kOut = stg?.out1?.k
		}
		if (heap.coef.out1 && tout - hyst > tprd - stg?.out1?.temp) {
			heap.coef.out1 = false
			kOut = stg?.outDefault
		}

		// ***************************
		if (tout < tprd - stg?.out2?.temp || heap.coef.out2) {
			heap.coef.out2 = true
			kOut = stg?.out2?.k
		}
		if (heap.coef.out2 && tout - hyst > tprd - stg?.out2?.temp) {
			heap.coef.out2 = false
			kOut = stg?.out1?.k
		}
		// ***************************
		if (tout < tprd - stg?.out3?.temp || heap.coef.out3) {
			heap.coef.out3 = true
			kOut = stg?.out3?.k
		}
		if (heap.coef.out3 && tout - hyst > tprd - stg?.out3?.temp) {
			heap.coef.out3 = false
			kOut = stg?.out2?.k
		}
		// ***************************
	}
	// откл от коэффициентов
	if (heap.coef.onOut && tout > stg.outOn + hyst) {
		heap.coef.onOut = false
		kOut = stg?.outDefault
	}

	return kOut
}

/**
 * Настройки влажности: гистерезис абсолютной влажности в зависимости от темп. продукта
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
	// Температура продукта
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

	console.log(3333, 'Коэффициенты влажности', 'tprd', tprd, '< X;', 'Влажность: habs', habs)
	return habs
}
