const { data: store } = require('@store')
const { getIdSB, getOwnerClr } = require('@tool/get/building')

/**
 * Сохранение изменений
 * @param {object} val значение
 */
function fnPrev(id, val, level) {
	switch (level) {
		case 'watt':
			store.prev[id] = [val.Pa, val.Pb, val.Pc]
			break

		default:
			store.prev[id] = val
			break
	}
}
/**
 * Подготовка данных для записи в логи
 * @param {object} data Рама
 * @param {object} el Элемент рамы
 * @param {string} level Уровень лога (Имя лог файла)
 * @param {object} value Глобальный объект со значениями склада
 * @returns
 */
function message(data, el, level, value) {
	const { section, cooler } = data
	let secId, bldId, clrId, v, state
	//
	switch (level) {
		case 'fan':
			el.owner.type == 'section' ? (secId = el.owner.id) : (bldId = el.owner.id)
			break
		case 'device':
		case 'cooler':
			secId = el.sectionId
			break
		case 'aggregate':
			bldId = el.buildingId
			break
		case 'valve':
			secId = el.sectionId?.[0]
			v = value[el._id]?.close ? 'cls' : 'opn'
			break
		case 'heating':
			el.owner.type == 'section' ? (secId = el.owner.id) : (clrId = el.owner.id)
			v = value[el._id] ?? false
			break
		case 'watt':
			secId = el.sectionId
			v = value[el._id].Pa + value[el._id].Pb + value[el._id].Pc
			break
		case 'sensor':
			el.owner.type == 'section' ? (secId = el.owner.id) : el.owner.type == 'cooler' ? (clrId = el.owner.id) : (bldId = el.owner.id)
			v = value[el._id].value
			state = value[el._id].state
			break
		default:
			break
	}

	if (secId && !bldId) bldId = getIdSB(section, secId)
	const o = clrId ? getOwnerClr(section, cooler, clrId) : {}
	return {
		bldId: bldId ?? o.bldId,
		secId: secId ?? o.secId,
		clrId, // только у heating?
		id: el._id,
		value: v !== undefined ? v : value[el._id]?.state,
		state, // только у датчиков
		type: el?.type,
	}
}

/**
 * Разрешение на запись в логи
 * @param {object} val состояние
 * @returns {boolean} false - состояние не изменилось,  true - изменилось
 */
function check(val, prev, level) {
	// Значение состояния
	if (val === undefined) return false
	let v
	switch (level) {
		case 'watt':
			v = [val.Pa, val.Pb, val.Pc]
			break
		default:
			v = val
	}
	// Состояние не изменилось
	if (JSON.stringify(v) === JSON.stringify(prev)) return false
	// Состояние изменилось
	return true
}

function checkTyp(el, bld) {
	if (el === 'hin') return 'max'
	if (el === 'tprdL') return 'min'
	if (el === 'tin' && bld.type === 'cold') return 'max'
	return null
}

module.exports = { fnPrev, message, check, checkTyp }
