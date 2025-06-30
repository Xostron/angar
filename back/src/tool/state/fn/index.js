const _OBJECT_ID_LENGTH=24
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
function delta(value, old) {
	const r = {}
	for (const key in value) {
		value[key]
		switch (typeof value[key]) {
			case 'object':
				// Объекты
				if (JSON.stringify(value[key]) !== JSON.stringify(old[key])) r[key] = value[key]
				break
			default:
				// Простые данные: числа, строки, null, undefined
				if (value[key] !== old[key]) r[key] = value[key]
				break
		}
	}
	// console.log(5551, old)
	return r
}


/**
 * Расчет delta изменений с учетом допусков
 * @param {object} present Актуальное состояние
 * @param {object} past Предыдущее состояние
 * @param {object} tolerance Допуски изменений
 * @returns {object} delta изменения
 */
function fnDiffing(present, past, tolerance) {
	const r = {}
	for (const key in value) {
		value[key]
		switch (typeof value[key]) {
			case 'object':
				// Объекты
				if (JSON.stringify(value[key]) !== JSON.stringify(old[key])) r[key] = value[key]
				break
			default:
				// Простые данные: числа, строки, null, undefined
				if (value[key] !== old[key]) r[key] = value[key]
				break
		}
	}
	// console.log(5551, r)
	return r
}

module.exports = { convertPC, convertSec, convert, convertTenta, delta, fnDiffing }
