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
	for (const fld in obj) ['rh', 'ah', 'temp', 'value', 'valve'].includes(fld) ? null : (r[`${key}.${fld}`] = obj[fld])
	return r
}

// Преобразование данных для Tenta
function convertTenta(value, pcId) {
	const r = []
	for (const key in value) {
		const fld = key.split('.')
		// console.log(fld)
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
				// Объекты
				if (JSON.stringify(present[key]) !== JSON.stringify(past[key])) r[key] = present[key]
				break
			default:
				// Простые данные: числа, строки, null, undefined
				if (present[key] !== past[key]) r[key] = present[key]
				break
		}
	}
	// console.log(5551, past)
	return r
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
				// Объекты
				checkObj(key, present, past, sens, tolerance, r)
				break
			default:
				// Простые данные: числа, строки, null, undefined
				if (present[key] !== past[key]) r[key] = present[key]
				break
		}
	}
	return r
}

module.exports = { convertPC, convertSec, convert, convertTenta, delta, deltaTol }

function checkObj(key, present, past, sens, tolerance, result) {
	// Обычный ключ: temp,rh,ah
	if (key.length < _OBJECT_ID_LENGTH) {
		fnIf(key, key, tolerance, present, past, result)
		return
	}
	// Составной ключ: id.id
	if (key.length === _OBJECT_ID_LENGTH * 2 + 1) {
		const fld = key.split('.')
		fnIf(key, fld[1], sens, present, past, result)
		return
	}
	// Составной ключ: id.id+слово
	if (key.length > _OBJECT_ID_LENGTH * 2 + 1) {
		const fld = key.split('.')
		const fldd = fld[1].slice(_OBJECT_ID_LENGTH, fld[1].length)
		fnIf(key, fldd, tolerance, present, past, result)
		return
	}
}

function fnIf(key, fld, tolerance, present, past, result) {
	if (tolerance[fld] !== undefined) {
		if (
			past[key].state != present[key].state ||
			present[key].value > +past[key].value + tolerance[fld] ||
			present[key].value < +past[key].value - tolerance[fld]
		) {
			result[key] = present[key]
			console.log(22200222, key, fld, result[key])
		}
	} else {
		if (JSON.stringify(present[key]) !== JSON.stringify(past[key])) result[key] = present[key]
		result[key] ? console.log(333, key, fld) : null
	}
}
