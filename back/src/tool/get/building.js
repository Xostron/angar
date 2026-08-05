// Получить buildingId из ПЛК модуля
function getIdB(mdlId, module) {
	return module.find((el) => mdlId == el?._id)?.buildingId
}

// Получить склад
function getB(building, idB) {
	if ((!building) instanceof Array) return null
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
// Получить id склада по испарителю
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

/**
 * Получить массив id секций по id склада
 * @param {*} section
 * @param {*} idB
 * @returns
 */
function getIdsS(section = [], idB) {
	return section
		.filter((el) => el.buildingId === idB)
		.sort((a, b) => a.order - b.order)
		.map((el) => el._id)
}

/**
 * Получить секции в режиме авто | руч
 * @param {*} idB Ид склада
 * @param {*} obj Глобальные данные
 * @param {boolean} mod Модификатор
 * @returns {object[]} mod = false - массив ИД секций, mod = true - массив рамы секций
 */
function getSectAM(idB, section, obj, mod = false) {
	const r = section.filter(
		(el) => el.buildingId == idB && obj.retain?.[idB]?.mode?.[el._id] !== null,
	)
	return mod ? r : r.map((el) => el._id)
}

/**
 * Получить секции в режиме авто
 * @param {*} idB Ид склада
 * @param {*} obj Глобальные данные
 * @param {boolean} mod Тип результата
 * @returns {object[]} Массив секций ИД (mod=false) или рама (mod=true)
 */
function getSectAuto(idB, obj, mod = false) {
	const { data, retain } = obj
	// Получить секции в авто
	const r = data.section.filter(
		(el) =>
			el.buildingId == idB &&
			(retain?.[idB]?.mode?.[el._id] === undefined || retain?.[idB]?.mode?.[el._id] === true),
	)
	return mod ? r : r.map((el) => el._id)
}

/**
 * Получить Id склада от любого исполнительного механизма
 * @param {object} el Рама исполнительного механизма
 * @param {object[]} section Рама секций
 * @returns {string} idB ИД склада
 */
function getIDB(el, section) {
	if (!section || !section?.length) return null
	return el?.buildingId ?? section.find((sect) => sect._id === el.sectionId)?.buildingId
}

/**
 * Получить массив ID склада и его секций
 * @param {object[]} section Рама секций
 * @param {string} idB ИД склада
 * @returns
 */
function getIdBS(section = [], idB) {
	const ids = section?.filter((el) => el.buildingId === idB)?.map((el) => el._id) ?? []
	ids.push(idB)
	return ids
}

function getBbySig(sig, data) {
	switch (sig?.owner?.type) {
		case 'building':
			return sig.owner.id
		case 'section':
			const sect = data?.section?.find((el) => el._id === sig.owner.id)
			return sect?.buildingId
		default:
			return null
	}
}

/**
 * Получить владельца периферии
 * @param {*} o Исходный элемент: Сигнал, ВНО, испаритель и т.д. из периферии
 * @param {*} data Объект рымы (obj.data = {building, section, cooler, fan ...})
 * @returns {object} Владелец ПУ: склад, секция, ?(опционально)испаритель
 */
function getOwner(o, data) {
	let ownerId = o?.owner?.id ?? o.sectionId
	ownerId = ownerId instanceof Array ? ownerId[0] : ownerId
	const ownerType = o?.owner?.type ?? 'section'
	let sect, cooler
	switch (ownerType) {
		case 'building':
			return { bld: data.building.find((el) => el._id === ownerId) }
		case 'section':
			sect = data?.section?.find((el) => el._id === ownerId)
			return {
				bld: data.building.find((el) => el._id === sect?.buildingId),
				sect,
			}
		case 'cooler':
			cooler = data?.cooler?.find((el) => el._id === ownerId)
			sect = data?.section?.find((el) => el._id === cooler.sectionId)
			return {
				bld: data.building.find((el) => el._id === sect.buildingId),
				sect,
				cooler,
			}
		default:
			return null
	}
}

/**
 * Получить полное имя всех владельцев строкой
 * @param {*} o Субъект: Сигнал, ВНО, испаритель и т.д. из периферии
 * @param {*} data
 * @param {obj} option 	sep Символ сепаратор между именами
						mod true - внести имя субъекта(по-умолчанию),
 * 							false - не учитывать имя субъекта
						flt Фильтр ключей (по умолчанию показывать все доступные имена)
 * @returns {string} 
 */
function getOwnerName(o, data, option = { mod: true, sep: ' - ', flt: ['bld', 'sect', 'cooler'] }) {
	option = { mod: true, sep: ' - ', flt: ['bld', 'sect', 'cooler'], ...option }
	const r = getOwner(o, data)
	if (!r) return ''

	const name = []
	for (const key in r) {
		if (!option.flt.includes(key)) continue
		if (!r[key]?.name) continue
		name.push(r[key].name)
	}
	if ((o?.name || o?.device?.name) && option.mod) name.push(o.name ?? o?.device?.name)

	return name.join(option.sep)
}

module.exports = {
	getIdB,
	getB,
	getBS,
	getS,
	getIdByClr,
	getIdSB,
	getOwnerClr,
	getIdsS,
	getIDB,
	getIdBS,
	getBbySig,
	getSectAM,
	getSectAuto,
	getOwner,
	getOwnerName,
}
