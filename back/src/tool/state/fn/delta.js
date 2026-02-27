const merge = require('./merge')
const _OBJECT_ID_LENGTH = 24

/**
 * Расчет delta изменений с учетом допусков
 * @param {object} present Актуальное состояние
 * @param {object} past Предыдущее состояние
 * @param {object} tolerance Допуски изменений
 * @returns {object} delta изменения
 */
function deltaTol(present, past, sens, tolerance) {
	const r = {}
	for (const key in present) {
		switch (typeof present[key]) {
			case 'object':
				// Объекты
				// Нет изменений - пропускаем
				if (compareArr(present[key], past[key])) break
				checkObj(key, present, past, sens, tolerance, r)
				break
			default:
				// Простые данные: числа, строки, null, undefined
				const fld = key.split('.')
				const fldd = fld[1].slice(_OBJECT_ID_LENGTH, fld[1].length)
				if (fldd === 'count') {
					merge(key, fldd, tolerance, present, past, r)
					break
				}
				if (present[key] !== past[key]) r[key] = present[key]
				break
		}
	}
	return r
}

/**
 * Сравнение массивов объектов
 * @param {*} present
 * @param {*} past
 * @returns false - элементы разные, true - элементы идентичны
 */
function compareArr(present, past) {
	// Если не массивы - выход из проверки
	if (!(present instanceof Array) || !(past instanceof Array)) return false
	// Если не равны по длине выход из проверки
	if (present.length !== past.length) return false
	// Проверка элементов массива
	for (let i = 0; i < present.length; i++) {
		const prt = JSON.parse(JSON.stringify(present[i]))
		const pst = JSON.parse(JSON.stringify(past[i]))
		delete prt.date
		delete prt.uid
		delete pst.date
		delete pst.uid
		// Если элемент массива не равен - останавливаем цикл и выходим
		if (JSON.stringify(prt) !== JSON.stringify(pst)) return false
	}
	// Если элементы идентичны, то true
	return true
}

/**
 * Сравнение объектов
 * @param {*} key
 * @param {*} present
 * @param {*} past
 * @param {*} sens
 * @param {*} tolerance
 * @param {*} result
 * @returns
 */
function checkObj(key, present, past, sens, tolerance, result) {
	// Обычный ключ: temp,rh,ah
	if (key.length < _OBJECT_ID_LENGTH) {
		merge(key, key, tolerance, present, past, result)
		return
	}
	// Составной ключ: id.id
	if (key.length === _OBJECT_ID_LENGTH * 2 + 1) {
		const fld = key.split('.')
		merge(key, fld[1], sens, present, past, result)
		return
	}
	// Составной ключ: id.id+слово
	if (key.length > _OBJECT_ID_LENGTH * 2 + 1) {
		const fld = key.split('.')
		const fldd = fld[1].slice(_OBJECT_ID_LENGTH, fld[1].length)
		merge(key, fldd, tolerance, present, past, result)
		return
	}
}

module.exports = deltaTol
