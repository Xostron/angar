const { data: store } = require('@store')
const { getIdSB, getOwnerClr } = require('@tool/get/building')
// Зона нечувствительности изменений
const hyst = {
	voltage: 10,
}

/**
 * Сохранение изменений
 * @param {object} val значение
 */
function fnPrev(id, val, level) {
	switch (level) {
		case 'voltage':
			store.prev[id] = [val?.Ua, val?.Ub, val?.Uc]
			break
		case 'watt':
			store.prev[id] = [val?.Pa, val?.Pb, val?.Pc]
			break
		case 'cooler':
			store.prev[id] = val?.state
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
	let secId, bldId, clrId, v, state, name
	//
	switch (level) {
		case 'fan':
			el.owner.type == 'section' ? (secId = el.owner.id) : (bldId = el.owner.id)
			v = value[el._id]?.state === 'run' ? 1 : 0
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
			v = value[el._id]?.close ? 0 : 1
			break
		case 'heating':
			el.owner.type == 'section' ? (secId = el.owner.id) : (clrId = el.owner.id)
			v = +value[el._id] ?? 0
			break
		case 'voltage':
			secId = el.sectionId
			v = [value[el._id].Ua, value[el._id].Ub, value[el._id].Uc]
			break
		case 'watt':
			secId = el.sectionId
			v = value[el._id].Pa + value[el._id].Pb + value[el._id].Pc
			break
		case 'sensor':
			el.owner.type == 'section'
				? (secId = el.owner.id)
				: el.owner.type == 'cooler'
					? (clrId = el.owner.id)
					: (bldId = el.owner.id)
			v = value?.[el._id]?.value
			state = value?.[el._id]?.state
			break
		case 'bindingAi':
			secId = el.owner.id
			v = value?.[el._id]?.value
			state = value?.[el._id]?.state
			name = el.name
			break
		default:
			break
	}

	if (secId && !bldId) bldId = getIdSB(section, secId)
	const o = clrId ? getOwnerClr(section, cooler, clrId) : {}
	return {
		bldId: bldId ?? o.bldId,
		secId: secId ?? o.secId,
		clrId, // Только у heating
		id: el._id,
		value: v !== undefined ? v : value[el._id]?.state,
		state, // Только у датчиков и bindingAi
		type: el?.type,
		name: el.name, //только у binding ai
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
	let v, vprev
	switch (level) {
		case 'voltage':
			v = [val?.Ua, val?.Ub, val?.Uc]
			vprev = prev??[]
			break
		case 'watt':
			v = [val?.Pa, val?.Pb, val?.Pc]
			vprev = prev??[]
			break
		case 'valve':
			v = [val?.open, val?.close]
			vprev = [prev?.open, prev?.close]
			break
		case 'cooler':
			v = val.state
			vprev = prev
			break
		case 'fan':
			v = { state: val?.state }
			vprev = { state: prev?.state }
			break
		default:
			v = val
			vprev = prev
	}

	return isChanged(v, vprev, level)
}
// Были ли изменения между предыдущим и текущим показателями
// true - есть изменения
function isChanged(v, vprev, level) {
	switch (level) {
		case 'voltage':
			if (vprev.every((el) => el === undefined)) return true
			return v.some((el, i) => el > vprev[i] + hyst.voltage || el < vprev[i] - hyst.voltage)
		case 'watt':
		case 'valve':
		case 'cooler':
		case 'fan':
			if (JSON.stringify(v) === JSON.stringify(vprev)) return false
			return true
		default:
			if (JSON.stringify(v) === JSON.stringify(vprev)) return false
			return true
	}
}

function checkTyp(el, bld) {
	if (el === 'hin') return 'max'
	if (el === 'tprdL') return 'min'
	if (el === 'tin' && bld.type === 'cold') return 'max'
	return null
}

module.exports = { fnPrev, message, check, checkTyp }
