const { data } = require('@store')

// Записать в extra событие
function wrExtra(buildingId, sectionId, name, o, type) {
	data.alarm.extra ??= {}
	data.alarm.extra[buildingId] ??= {}
	if (!type) {
		if (!sectionId) {
			data.alarm.extra[buildingId][name] = o
			return
		}
		data.alarm.extra[buildingId][sectionId] ??= {}
		data.alarm.extra[buildingId][sectionId][name] = o
	} else {
		if (!sectionId) {
			data.alarm.extra[buildingId][name] ??= {}
			data.alarm.extra[buildingId][name][type] = o
			return
		}
		data.alarm.extra[buildingId][sectionId] ??= {}
		data.alarm.extra[buildingId][sectionId][name] ??= {}
		data.alarm.extra[buildingId][sectionId][name][type] = o
	}
}

// Записать в extra событие
function delExtra(buildingId, sectionId, name, type) {
	if (!type) {
		if (!sectionId) {
			delete data.alarm?.extra?.[buildingId]?.[name]
			return
		}
		delete data.alarm?.extra?.[buildingId]?.[sectionId]?.[name]
	} else {
		if (!sectionId) {
			delete data.alarm?.extra?.[buildingId]?.[name]?.[type]
			return
		}
		delete data.alarm?.extra?.[buildingId]?.[sectionId]?.[name]?.[type]
	}
}

module.exports = { wrExtra, delExtra }
