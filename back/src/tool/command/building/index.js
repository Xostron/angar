// Получить buildingId из ПЛК модуля
function getIdB(mdlId, module) {
	return module.find((el) => mdlId == el?._id)?.buildingId
}

// Получить склад
function getB(building, idB) {
	if (!building instanceof Array) return null
	return building.find((b) => b._id == idB)
}

// Получить склад и секцию по датчику
function getBS(sens, equip) {
	let section, building
	if (sens?.owner?.type === 'building')
		return {
			building: equip.building.find((b) => b._id == sens?.owner?.id),
			section: null,
		}
	if (sens?.owner?.type === 'section') {
		section = equip.section.find((o) => o._id == sens?.owner?.id)
		building = equip.building.find((b) => b._id == section?.buildingId)
		return { building, section }
	}
	const sectionId = equip.cooler.find((o) => o._id === sens?.owner?.id)?.sectionId
	section = equip.section.find((o) => o._id === sectionId)
	building = equip.building.find((b) => b._id == section?.buildingId)
	return { building, section }
}

function getS(id, where = []) {
	const f = where?.find((el) => el._id === id)
	return f?.sectionId ?? f?.owner?.id ?? null
}
// Получить id склада по холодильника
function getIdByClr(section, clr) {
	return section.find((el) => el._id === clr.sectionId)?.buildingId
}

// Получить id склада и секции по id холодильника
function getOwnerClr(section, cooler, id) {
	const clr = cooler.find((el) => el._id === id)
	const s = section.find((el) => el._id === clr.sectionId)
	if (!s) return null
	return {
		bldId: s?.buildingId,
		secId: s?._id,
	}
}

/**
 * Получить Id склада
 * @param {*} section Рама секций
 * @param {*} id ID секции
 * @returns
 */
function getIdSB(section, id) {
	return section.find((el) => el._id === id)?.buildingId
}

module.exports = { getIdB, getB, getBS, getS, getIdByClr, getIdSB, getOwnerClr }
