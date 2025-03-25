const { data } = require('@store')

// Получить extralrm аварию
function isExtralrm(bldId, secId, name) {
	return secId ? !!data.alarm?.extralrm?.[bldId]?.[secId]?.[name] : !!data.alarm?.extralrm?.[bldId]?.[name]
}

// Записать в extralrm (доп. аварии)
function wrExtralrm(buildingId, sectionId, name, o) {
	data.alarm.extralrm ??= {}
	data.alarm.extralrm[buildingId] ??= {}
	if (!sectionId) {
		data.alarm.extralrm[buildingId][name] = o
		return
	}
	data.alarm.extralrm[buildingId][sectionId] ??= {}
	data.alarm.extralrm[buildingId][sectionId][name] = o
}
// Удалить из extralrm (доп. аварии)
function delExtralrm(buildingId, sectionId, name) {
	if (!sectionId) {
		delete data.alarm?.extralrm?.[buildingId]?.[name]
		return
	}
	delete data.alarm?.extralrm?.[buildingId]?.[sectionId]?.[name]
}

/**
 *  Аварии возникающие в секции, но останавливающие работу всего склада
 * @param {object} building склад
 * @param {object} obj глобальные данные о складах
 * @returns {boolean} Наличие аварий секции
 */
function sumExtralrmSection(building, obj) {
	const { data } = obj
	const section = data.section.filter((el) => el.buildingId == building._id)
	let alrS = false
	//Список аварий: Аварийное закрытие клапанов
	const list = ['alrClosed']
	// id секций склада
	const secIds = section.map((el) => el._id)
	// аварии склада
	const alrSect = data.alarm?.extralrm?.[building._id]
	// Поиск аварий из списка
	// По секциям
	for (const sId in alrSect) {
		if (!secIds.includes(sId)) continue
		// по авариям в секции
		for (const alrId in data.alarm?.extralrm?.[building._id]?.[sId]) {
			// авария не найдена
			if (!list.includes(alrId)) continue
			// авария найдена, тут же выходим
			alrS = true
			break
		}
		if (alrS) break
	}
	return alrS
}

module.exports = {isExtralrm, wrExtralrm, delExtralrm, sumExtralrmSection}