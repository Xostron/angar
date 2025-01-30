const { ms } = require('@tool/command/time')

// Заполнить настройки значениями
/**
 *
 * @param {object} r Результат
 * @param {object} rtn Пользовательские настройки
 * @param {object} fct Заводские настройки
 * @param {function} cb функция - проверка и запись значения
 * @param {string} codeS - код настройки
 * @param {string} codeP - код продукта
 * @param {boolean} isPrd - настройка с продуктом
 */
function fill(r, rtn, fct, cb, codeS, codeP, isPrd) {
	const o = {}
	let retain, factory
	// с продуктом
	if (isPrd) {
		retain = rtn?.[codeP]
		factory = fct?.[codeP]
	} else {
		// без продукта
		retain = rtn
		factory = fct
	}
	// Проход по сохраненным значениям настроек
	mark(o, retain, cb, codeS, 'rtn')
	// Проход по заводским значениям (полнота настроек)
	mark(o, factory, cb, codeS, 'fct')

	r[codeS] ??= {}
	r[codeS] = o
	if (isPrd) r[codeS].prd = codeP
}

/**
 * Обработка mark и markList значений
 * @param {*} r Результат
 * @param {*} sett retain настройки
 * @param {*} cb Проверка значения настройки (retain)
 * @param {*} key код настройки
 * @returns
 */
function mark(r, sett, cb, key, mod) {
	if (!sett) return
	// по mark
	for (const m in sett) {
		// по marklist
		for (const ml in sett[m]) {
			// Если имя mark === markList
			if (m === ml) {
				cb(r, ml, sett?.[m]?.[ml], key, mod)
			} else {
				// имя mark!==markList => конкатенация имен
				r[m] ??= {}
				cb(r[m], ml, sett?.[m]?.[ml], key, mod)
			}
		}
	}
}

// Проверка и присвоение значения настройки полю
function cb(v, code, value, key, mod) {
	if (isV(v, code, value, mod)) {
		// для всех marklist c типом time, кроме настройки idle
		if (value.toString().includes(':') && key !== 'idle') return (v[code] = ms(value))
		v[code] = !isNaN(+value) && typeof value !== 'boolean' ? +value : value
	}
}

// Результат проверки значения настройки для пользовательской или заводской
function isV(v, code, value, mod = 'rtn') {
	// для retain
	if (mod === 'rtn') {
		return isValid(value)
	} else {
		// для factory
		return !isValid(v[code]) && isValid(value)
	}
}

// Валидность значения
function isValid(val) {
	if (val === '' || val === null || val === undefined || val === '-') return false
	return true
}

module.exports = { fill, cb }
