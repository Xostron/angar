const { data } = require('@store')

// Achieve - это информационные сообщения режима: температура продукта достигла задания и т.д.
// Записать в achieve (доп. функции)
function wrAchieve(buildingId, name, o) {
	data.alarm.achieve ??= {}
	data.alarm.achieve[buildingId] ??= {}
	data.alarm.achieve[buildingId][name] ??= {}
	data.alarm.achieve[buildingId][name][o.code] = o
}

// Удалить из aciheve
function delAchieve(buildingId, name, code) {
	delete data?.alarm?.achieve?.[buildingId]?.[name]?.[code]
}

// Обновить запись сообщения
function updAchieve(buildingId, name, code, set) {
	if (!data.alarm.achieve?.[buildingId]?.[name]?.[code]) return
	for (const key in set) {
		data.alarm.achieve[buildingId][name][code][key] = set[key]
	}
}

module.exports = { wrAchieve, delAchieve, updAchieve }
