const mesTimer = require('@dict/ban_timer')
const { data } = require('@store')

// Записать в Таймеры запретов
function wrTimer(bld, key, name) {
	// data.alarm ??= {}
	data.alarm.timer ??= {}
	data.alarm.timer[bld._id] ??= {}
	const o = mesTimer.get(bld, name, key)
	!isTimer(bld._id, key)
		? (data.alarm.timer[bld._id][key] = o)
		: (data.alarm.timer[bld._id][key] = { ...data.alarm.timer[bld._id][key], msg: o.msg })
}
// Удалить из Таймеров запретов
function delTimer(buildingId, key) {
	delete data.alarm.timer?.[buildingId]?.[key]
}

// Получить extralrm аварию
function isTimer(idB, key) {
	return data.alarm.timer?.[idB]?.[key]
}
module.exports = { wrTimer, delTimer }
