/**
 * Спрятанные настройки
 * @param {object} prd Продукт
 * @param {object} factory Объект полей заводских значений
 * @param {object} coef Объект полей активных коэффициентов
 * @param {object} retain Объект полей пользовательских значений
 * @param {boolean} mode
 * @returns {object[]} массив названий полей,
 * которых необходимо скрыть (mode=true)/активная настройка (mode=false)
 */
function fnSkip(prd, factory, coef, retain, hid, mode = true) {
	// Список полей настроек, массив названия полей
	const list = prd ? (factory?.[prd] ?? factory) : null
	// Коды полей настроек
	const keys = Object.keys(list ?? {})
	// Массив полей настроек, которые необходимо скрыть/показать
	const aKey = []
	// Кнопки скрыть/показать
	const hidKeys = Object.entries(hid)?.map((el) => [
		el?.[0]?.split('.')?.at(-1),
		el?.[1] ?? false,
	])
	// Список кодов настроек которые необходимо скрыть (mode=true)/показать (mode=false)
	for (const key in coef) {
		const r = keys.filter((el) => {
			// Пропускаем поля настроек, которые должны показываться всегда
			if (!el.includes(key) || el.includes('text-collapse')) return false
			// Пользовательские значения поля настройки
			const rtn = retain?.[el]
			// Значение поля настройки: заводская + пользовательская
			const rtnFct = { ...list[el], ...rtn }
			// Сравниваем активную настройку от ангара (истинную) с значением поля настройки заводская + пользовательская
			// Значение кнопки
			const hh = hidKeys.find((h) => el.includes(h?.[0]))
			// Результат: скрытые настройки (mode=true)/активная настройка (mode=false)
			return mode ? !isEqual(coef[key], rtnFct, hh) : isEqual(coef[key], rtnFct)
		})
		aKey.push(...r)
	}

	return aKey
}

//
/**
 * Сравнение объектов (вложенные объекты не поддерживаются)
 * @param {object} eq1
 * @param {object} eq2
 * @param {object[]} Кнопки скрыть/показать: undefined|false - скрыть, true - показать
 * @returns {boolean} true объекты равны
 */
function isEqual(eq1 = {}, eq2 = {}, hh = []) {
	// Объекты разные по размеру ИЛИ нажата ли кнопка скрыть(undefined|false)/показать(true) -> не равны (показывать)
	if (Object.keys(eq1).length !== Object.keys(eq2).length) return false
	if (hh?.[1]) return true
	// Проверка ключ-значение
	for (const key in eq1) {
		if (eq1[key] != eq2?.[key]) return false
	}
	return true
}

export { fnSkip, isEqual }

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
