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
	// console.log(880033, 'ДАВЛЕНИЕ', key, fld, present[key], past[key])
	// Без допуска
	if (tolerance[fld] === undefined) {
		if (JSON.stringify(present[key]) !== JSON.stringify(past[key])) {
			result[key] = present[key]
			// console.log(880031, 'без допуска -> НЕидентичен', key, present[key])
		}
		return
	}
	// С допуском для count (число дней сушки)
	if (fld === 'count') {
		if (
			+present[key] >= +past[key] + tolerance[fld] ||
			+present[key].value <= +past[key] - tolerance[fld] ||
			Math.trunc(present[key]) !== Math.trunc(past[key])
		)
			result[key] = present[key]
		return
	}
	// Для давления
	if (fld === 'p') {
		if (
			+present[key] >= +past[key] + tolerance[fld] ||
			+present[key].value <= +past[key] - tolerance[fld]
		)
			result[key] = present[key]
		return
	}
	// С допуском для показаний датчиков: проверяется отсечка по допуску (tolerance) и по отсчечке целого числа
	if (
		past[key].state != present[key].state ||
		+present[key].value >= +past[key].value + tolerance[fld] ||
		+present[key].value <= +past[key].value - tolerance[fld] ||
		Math.trunc(present[key].value) !== Math.trunc(past[key].value)
	) {
		result[key] = present[key]
		console.log(
			880032,
			'с допуском -> НЕидентичен',
			key,
			present[key],
			past[key],
			+present[key].value >= +past[key].value + tolerance[fld],
			+present[key].value <= +past[key].value - tolerance[fld],
			Math.trunc(present[key].value) !== Math.trunc(past[key].value)
		)
	}
	// console.log(880033, 'Идентичен', key, present[key])
}

module.exports = merge
