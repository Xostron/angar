const { data: store } = require('@store')

/**
 * @description Системные настройки: Коэф-ты выпуск. клапана в зависимости от темп. улицы
 * @param {object} stg Системные настройки
 * @param {object} bld Склад
 * @param {object} obj Глобальные данные
 * @returns {object} { kOut, kIn }
 */
function coefVlv(stg, bld, obj) {
	const { value, data } = obj
	// Температура улицы (мин)
	const tout = value?.total?.[bld._id]?.tout?.min
	// Температура продукта и гистерезис
	const tprd = value?.total?.[bld._id]?.tprd?.min
	const hyst = 1
	//Куча для отслеживания гистерезиса
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

	// console.log(5555, 'Коэффициенты клапана', 'tout', tout, '<', stg.outOn, { kOut, kIn })
	return { kOut, kIn }
}

// Работа по коэффициентам
function outOn(bld, stg, tout, tprd, hyst) {
	store.heap[bld._id] ??= {}
	const heap = store.heap[bld._id]
	heap.coef ??= {}

	let kOut = {k:stg?.outDefault}

	// подключение к коэффициентам
	if (tout < stg.outOn || heap.coef.onOut) {
		heap.coef.onOut = true
		// ***************************
		if (tout < tprd - stg?.out1?.temp || heap.coef.out1) {
			heap.coef.out1 = true
			kOut = stg?.out1
		}
		if (heap.coef.out1 && tout - hyst > tprd - stg?.out1?.temp) {
			heap.coef.out1 = false
			kOut = {k:stg?.outDefault}
		}

		// ***************************
		if (tout < tprd - stg?.out2?.temp || heap.coef.out2) {
			heap.coef.out2 = true
			kOut = stg?.out2
		}
		if (heap.coef.out2 && tout - hyst > tprd - stg?.out2?.temp) {
			heap.coef.out2 = false
			kOut = stg?.out1
		}
		// ***************************
		if (tout < tprd - stg?.out3?.temp || heap.coef.out3) {
			heap.coef.out3 = true
			kOut = stg?.out3
		}
		if (heap.coef.out3 && tout - hyst > tprd - stg?.out3?.temp) {
			heap.coef.out3 = false
			kOut = stg?.out2
		}
		// ***************************
	}
	// откл от коэффициентов
	if (heap.coef.onOut && tout > stg.outOn + hyst) {
		heap.coef.onOut = false
		kOut = {k:stg?.outDefault}
	}

	return kOut
}

module.exports = coefVlv
