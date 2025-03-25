const { data } = require('@store')

// Записать в Таймеры запретов
function wrTimer(buildingId, key, name) {
	// data.alarm ??= {}
	data.alarm.timer ??= {}
	data.alarm.timer[buildingId] ??= {}
	data.alarm.timer[buildingId][key] = mesTimer.get(name, key)
}
// Удалить из Таймеров запретов
function delTimer(buildingId, key) {
	delete data.alarm.timer?.[buildingId]?.[key]
}

module.exports = { wrTimer, delTimer }
