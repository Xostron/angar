const { data:store } = require('@store')

// Получить extralrm аварию
function isExtralrm(idB, idS, code) {
	return idS ? !!store.alarm?.extralrm?.[idB]?.[idS]?.[code] : !!store.alarm?.extralrm?.[idB]?.[code]
}

// Записать в extralrm (доп. аварии)
function wrExtralrm(buildingId, idS, name, o) {
	store.alarm.extralrm ??= {}
	store.alarm.extralrm[buildingId] ??= {}
	if (!idS) {
		store.alarm.extralrm[buildingId][name] = o
		return
	}
	store.alarm.extralrm[buildingId][idS] ??= {}
	store.alarm.extralrm[buildingId][idS][name] = o
}
// Удалить из extralrm (доп. аварии)
function delExtralrm(idB, idS, name) {
	if (!idS) {
		delete store.alarm?.extralrm?.[idB]?.[name]
		return
	}
	
	delete store.alarm?.extralrm?.[idB]?.[idS]?.[name]
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
	const list = ['alrClosed','overVlv', 'antibliz']
	// id секций склада
	const secIds = section.map((el) => el._id)
	// аварии склада
	const alrSect = store.alarm?.extralrm?.[building._id]
	// Поиск аварий из списка
	// По секциям
	for (const sId in alrSect) {
		if (!secIds.includes(sId)) continue
		// по авариям в секции
		for (const alrId in store.alarm?.extralrm?.[building._id]?.[sId]) {
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