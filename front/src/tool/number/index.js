function validNumber(val, min) {
	// получение value с защитой от пробела
	let r = val.trim()

	// защита от ввода букв и символов (кроме -)
	if (isNaN(r) && r !== '-') r = r?.slice(0, -1)

	// защита от вставки текста
	if (r.length > 0 && isNaN(r) && r !== '-') r = ''

	// защита от минуса при min=0
	if (min >= 0 && r === '-') r = ''

	for (let i = 0; i < 10; i++) {
		// защита от вставки нолей без точки после первого ноля
		let k = '-0',
			m = '0'
		if (r === k + String(i) || r === m + String(i)) r = r?.slice(0, -1)
	}
	return r
}

/**
 * toFixed без округления
 * @param {*} v Число
 * @param {*} precision Точность - кол-во цифр после точки
 * @returns
 */
function decimal(v, precision) {
	const idx = v.toString().indexOf('.')
	if (idx === null) return v

	let base = v.toString().substring(0, idx)
	let part = idx > 0 ? v.toString().substring(idx) : ''
	if (part.length > precision) {
		part = part.substring(0, precision + 1)
		return base + part
	}
	return v
}

export { validNumber, decimal }
