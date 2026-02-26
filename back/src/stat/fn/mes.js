const { data: store } = require('@store')
const { getIdSB, getOwnerClr } = require('@tool/get/building')

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

module.exports = message