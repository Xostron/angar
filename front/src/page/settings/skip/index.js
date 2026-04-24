/**
 * Спрятанные настройки
 * @param {object} prd Продукт
 * @param {object} factory Объект полей заводских значений
 * @param {object} coef Объект полей активных коэффициентов
 * @param {object} retain Объект полей пользовательских значений
 * @param {boolean} mode
 * @returns {object[]} массив названий полей,
 * которых необходимо скрыть (mode=true)/показать (mode=false)
 */
function fnSkip(prd, factory, coef, retain, mode = true) {
	// Список полей настроек, массив названия полей
	let o = prd?.code ? (factory?.[prd?.code] ?? factory) : null
	const oKeys = Object.keys(o ?? {})
	const oKey = []
	// Массив полей настроек, которые необходимо скрыть/показать
	for (const key in coef) {
		// console.log(22, key)
		const r = oKeys.filter((el) => {
			// console.log(el)
			if (!el.includes(key) || el.includes('text-collapse')) return false
			const rtn = retain[el]
			const rtnFct = { ...o[el], ...rtn }
			// console.log(33, key, el, coef[key], rtnFct, isEqual(coef[key], rtnFct, mode))
			return mode ? !isEqual(coef[key], rtnFct) : isEqual(coef[key], rtnFct)
		})
		oKey.push(...r)
	}
	return oKey
}

//
/**
 * Сравнение объектов (вложенные объекты не поддерживаются)
 * @param {object} eq1
 * @param {object} eq2
 * @returns {boolean} true объекты равны
 */
function isEqual(eq1 = {}, eq2 = {}) {
	if (Object.keys(eq1).length !== Object.keys(eq2).length) return false
	for (const key in eq1) {
		if (eq1[key] != eq2?.[key]) return false
	}
	return true
}

export default fnSkip

// // Активная настройка
// function fnAct(prd, factory, coef, retain) {
// 	let o = prd?.code ? (factory?.[prd?.code] ?? factory) : null
// 	let cf = coef ? Object.keys(coef) : null
// 	return coef && o
// 		? Object.entries(o).reduce((acc, [code, val]) => {
// 				const nv = retain?.[code] ?? {}
// 				let o = {}
// 				if (!isNaN(val[cf?.[0]]) && (!isNaN(val[cf?.[1]]) || !!val[cf?.[1]])) {
// 					o = { ...val, ...nv }
// 					// Для времени ожидания (CO2)
// 					let time
// 					if (`${o[cf?.[1]]}`.includes(':')) time = ms(o[cf?.[1]])

// 					if (
// 						o[cf?.[0]] == coef[cf?.[0]] &&
// 						(o[cf?.[1]] == coef[cf?.[1]] || time === coef[cf?.[1]])
// 					)
// 						acc.push(code)
// 				}
// 				return acc
// 			}, [])
// 		: null
// }
