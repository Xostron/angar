/**
 * Обновление state по отсечке и целой части
 * @param {*} key Полное имя ключа какого либо поля из state
 * @param {*} fld Часть полного ключа (id датчика | (count, min, max и т.д.))
 * @param {*} tolerance Отсечка (допуск)
 * @param {*} present Текущие показания state (которые участвуют в авторежиме)
 * @param {*} past Прошлые показания state (которое сейчас отображается в мобилке)
 * @param {*} result Обновленное показание state (для отображения в мобилке)
 * @returns {undefined}
 */
function merge(key, fld, tolerance, present, past, result) {
	// Проверка поля count - кол-во дней сушки
	if (fld === 'count') {
		// Целая часть - антье (от франц.)
		const isEntier = Math.trunc(present[key]) !== Math.trunc(past[key])
		check(key, result, present, isEntier)
	}
	// Проверка полей у которых нет отсечек (режимы, тип продукта и др. не числовые значения)
	else if (tolerance[fld] === undefined) {
		const isStringify = JSON.stringify(present[key]) !== JSON.stringify(past[key])
		check(key, result, present, isStringify)
	}
	// Для проверки датчиков и других объектов с ключами {value, state}
	else {
		// Состояние
		const isState = past[key]?.state != present[key].state
		// Целая часть - антье (от франц.)
		const isEntier = Math.trunc(present[key]?.value) !== Math.trunc(past[key]?.value)
		// Больше допуска
		const isMore = +present[key]?.value >= +past[key]?.value + tolerance[fld]
		// Меньше допуска
		const isLess = +present[key]?.value <= +past[key]?.value - tolerance[fld]
		if (tolerance[fld] >= 1) {
			check(key, result, present, isState, isMore, isLess)
		} else {
			check(key, result, present, isState, isEntier, isMore, isLess)
		}
	}
}

function check(key, result, present, ...conditions) {
	if (!conditions.includes(true)) return
	// console.log(88000, key, present[key], conditions)
	result[key] = present[key]
}

module.exports = merge
