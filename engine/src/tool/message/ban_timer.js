const mesTimer = require('@dict/ban_timer')
const { data } = require('@store')

// Записать в Таймеры запретов
function wrTimer(bld, key, name) {
	// data.alarm ??= {}
	data.alarm.timer ??= {}
	data.alarm.timer[bld._id] ??= {}
	data.alarm.timer[bld._id][key] = mesTimer.get(bld, name, key)
}
// Удалить из Таймеров запретов
function delTimer(buildingId, key) {
	delete data.alarm.timer?.[buildingId]?.[key]
}

module.exports = { wrTimer, delTimer }
