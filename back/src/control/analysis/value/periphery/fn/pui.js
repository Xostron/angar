const { data: store } = require('@store')

// Значения каналов модуля электроизмерений
function pui(doc, result, val) {
	result[doc._id] ??= {}
	if (!doc.module.id || !val?.[doc.module.id]) return
	// console.log(777,doc,val[doc.module.id])
	if (doc.module.name == 'МЭ210-701') puiTCP(doc, result, val)
	else puiRTU(doc, result, val)

	fnCache(doc._id, result?.[doc._id])
}

const puiRTU = (doc, result, val) => {
	// Напряжение
	result[doc._id].Ua = +val[doc.module.id][0]?.toFixed(1)
	result[doc._id].Ub = +val[doc.module.id][2]?.toFixed(1)
	result[doc._id].Uc = +val[doc.module.id][4]?.toFixed(1)
	// Ток
	result[doc._id].Ia = +val[doc.module.id][6]?.toFixed(1)
	result[doc._id].Ib = +val[doc.module.id][8]?.toFixed(1)
	result[doc._id].Ic = +val[doc.module.id][10]?.toFixed(1)
	// активная мощность
	result[doc._id].Pa = +val[doc.module.id][12]?.toFixed(1)
	result[doc._id].Pb = +val[doc.module.id][14]?.toFixed(1)
	result[doc._id].Pc = +val[doc.module.id][16]?.toFixed(1)
}
const puiTCP = (doc, result, val) => {
	// Напряжение
	result[doc._id].Ua = +val[doc.module.id][0]?.toFixed(1)
	result[doc._id].Ub = +val[doc.module.id][1]?.toFixed(1)
	result[doc._id].Uc = +val[doc.module.id][2]?.toFixed(1)
	// Ток
	// result[doc._id].Ia = +val[doc.module.id][6]?.toFixed(1)
	// result[doc._id].Ib = +val[doc.module.id][7]?.toFixed(1)
	// result[doc._id].Ic = +val[doc.module.id][8]?.toFixed(1)
	// активная мощность
	// result[doc._id].Pa = +val[doc.module.id][6]?.toFixed(1)
	// result[doc._id].Pb = +val[doc.module.id][7]?.toFixed(1)
	// result[doc._id].Pc = +val[doc.module.id][8]?.toFixed(1)
}

/**
 *
 * @param {*} id ИД счетчика
 * @param {*} v Показания счетчика {Ua:,Ub:,Uc:,Ia:,...Pc:}
 * @returns
 */
function fnCache(id, v) {
	// Если нет счетчика, выход
	if (!v) return
	// Кол-во попыток
	const approach = 3
	// Фиксируем попытки - 1 попытка=1 цикл
	store.heap.analysis[id] ??= 0

	// Если прошлых значений нет, то сохраняем прошлые значения и выходим
	if (!store?.prev?.analysis?.[id]) return setPrev(id, v)

	// Попытки исчерпаны -> обнуляем попытки (возврат первичных данных)
	if (store.heap.analysis[id] > approach) {
		store.heap.analysis[id] = 0
		return setPrev(id, v)
	}

	// Если кол-во попыток неисчерпано, то проверям на вовзрат кэша
	let flag = false
	// Проверяка текущих и прошлых значений
	for (const key in v) {
		if (v[key] === store?.prev?.analysis?.[id]?.[key]) continue
		// Возврат из кэша и устанавливаем флаг попыток
		v[key] = store?.prev?.analysis?.[id]?.[key]
		flag = true
	}
	setPrev(id, v)
	// Был возврат кэша, увеличиваем счетчик попыток
	if (flag) {
		store.heap.analysis[id] += 1
		flag = false
		return
	}
	// Первичные данные в норме, обнуляем счетчик попыток
	store.heap.analysis[id] = 0
	return
}

function setPrev(id, v = {}) {
	// Сохранение прошлых значений
	store.prev.analysis[id] = { ...(v ?? {}) }
}

module.exports = pui
