const _OBJECT_ID_LENGTH = 24
// PC  =  карточки складов
function convertPC(obj) {
	let r = {}
	for (const fld in obj) {
		if (['ah', 'rh', 'temp'].includes(fld)) r[fld] = obj[fld]
		else {
			const bldId = fld.slice(0, _OBJECT_ID_LENGTH)
			r[bldId + '.' + fld] = obj[fld]
		}
	}
	return r
}

// Секция = Полное описание секции + карточки секций + некоторая инфа по складу
function convertSec(obj) {
	let r = { buildings: new Set() }
	for (const secId in obj) {
		const bldId = obj[secId].bldId
		delete obj[secId].bldId
		// Поля склада и карточек секций
		if (!r.buildings.has(bldId)) {
			r.buildings.add(bldId)
			r = { ...r, ...convert(obj[secId], bldId) }
			r[`${bldId}.sections`] ??= []
			r[`${bldId}.sections`].push(secId)
		}
		// Полное описание секции
		// console.log(22, obj[secId].valve?.[secId])
		r = { ...r, ...convert(obj[secId].value, `${secId}`) }
		if (obj[secId].valve?.[secId]) r = { ...r, [secId + '.valve']: obj[secId].valve?.[secId] }
	}
	r.buildings = [...r.buildings]
	return r
}

function convert(obj, key) {
	const r = {}
	for (const fld in obj)
		['rh', 'ah', 'temp', 'value', 'valve'].includes(fld)
			? null
			: (r[`${key}.${fld}`] = obj[fld])
	return r
}

// Преобразование данных для Tenta
function convertTenta(value, pcId) {
	const r = []
	for (const key in value) {
		const fld = key.split('.')
		const o = {
			key: fld.pop(),
			value: value[key],
			owner: !fld.length ? pcId : fld.pop(),
		}
		r.push(o)
	}
	return r
}

// Расчет delta изменений
function delta(present, past) {
	const r = {}
	for (const key in present) {
		switch (typeof present[key]) {
			case 'object':
				// Нет изменений - пропускаем
				if (compareArr(present[key], past[key])) break
				// Элементы массива и другие объекты есть изменения - фиксируем
				if (JSON.stringify(present[key]) !== JSON.stringify(past[key])) {
					r[key] = present[key]
				}
				break
			default:
				// Простые данные: числа, строки, null, undefined
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
				// console.log(880001, 'object', key)
				// Объекты
				// Нет изменений - пропускаем
				if (compareArr(present[key], past[key])) break

				checkObj(key, present, past, sens, tolerance, r)
				break
			default:
				// console.log(880002, typeof present[key], key)
				// Простые данные: числа, строки, null, undefined
				const fld = key.split('.')
				const fldd = fld[1].slice(_OBJECT_ID_LENGTH, fld[1].length)
				if (fldd === 'count') {
					fnIf(key, fldd, tolerance, present, past, r)
					break
				}
				if (present[key] !== past[key]) r[key] = present[key]
				break
		}
	}
	return r
}

module.exports = { convertPC, convertSec, convert, convertTenta, delta, deltaTol }

function checkObj(key, present, past, sens, tolerance, result) {
	// console.log(5553, key)
	// Обычный ключ: temp,rh,ah
	if (key.length < _OBJECT_ID_LENGTH) {
		// console.log(880021, 'Проверка obj', key, present[key], past[key])
		fnIf(key, key, tolerance, present, past, result)
		return
	}
	// Составной ключ: id.id
	if (key.length === _OBJECT_ID_LENGTH * 2 + 1) {
		const fld = key.split('.')
		// console.log(880022, 'Проверка obj', key, present[key], past[key])
		fnIf(key, fld[1], sens, present, past, result)
		return
	}
	// Составной ключ: id.id+слово
	if (key.length > _OBJECT_ID_LENGTH * 2 + 1) {
		const fld = key.split('.')
		const fldd = fld[1].slice(_OBJECT_ID_LENGTH, fld[1].length)
		// console.log(880023, 'Проверка obj', key, present[key], past[key])
		fnIf(key, fldd, tolerance, present, past, result)
		return
	}
}

function fnIf(key, fld, tolerance, present, past, result) {
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
