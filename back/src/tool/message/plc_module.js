const { data } = require('@store')

// Разрешить true/заблокировать false опрос модуля
function timeout(buildingId, moduleId, ip, opt) {
	if (!buildingId || !moduleId) return true
	// Проверка debounce модуля: true - модуль ОК
	if (isDebMdl(buildingId, moduleId, opt)) return true
	// Модуль исправен - разрешить опрос
	if (!isErrM(buildingId, moduleId)) return true

	// Поставить неисправный модуль в ожидание
	// Время ожидания опроса
	const _TIME = data.tTCP * 60 * 1000
	const now = new Date().getTime()
	if (!data.timeout?.[moduleId]) data.timeout[moduleId] = now + _TIME
	// Время не прошло - блокировать опрос модуля
	if (now <= data.timeout?.[moduleId]) {
		console.log('Блокировать модуль', opt?.name, opt?.use, ip)
		return false
	}
	data.timeout[moduleId] = new Date().getTime() + _TIME
	console.log('Разрешить опрос', opt?.name, opt?.use, ip)
	// Время прошло - разрешить опрос
	return true
}

// Сохранить неисправный модуль сначала в антидребезг
function wrDebMdl(mdlId) {
	if (!data.debMdl?.[mdlId]) data.debMdl[mdlId] = new Date()
}

// Удалить модуль из антидребезга
function delDebMdl(mdlId = '') {
	if (!mdlId) data.debMdl = {}
	delete data.debMdl?.[mdlId]
}

// Удалить модуль из списка аварий
function delModule(buildingId, moduleId) {
	if (!moduleId) {
		delete data.alarm.module?.[buildingId]
		return
	}
	delete data.alarm.module?.[buildingId]?.[moduleId]
}

// Проверка внесен ли модуль в список неисправных
function isErrM(buildingId, moduleId) {
	return !!data.alarm.module?.[buildingId]?.[moduleId]
}

// Сохранить неисправный модуль в список аварий
function wrModule(buildingId, moduleId, o) {
	data.alarm.module ??= {}
	data.alarm.module[buildingId] ??= {}
	if (!data.alarm.module[buildingId]?.[moduleId]) data.alarm.module[buildingId][moduleId] = o
}

// Проверка внесен ли модуль в список антидребезга
function isDebMdl(buildingId, mdlId, opt) {
	if (!data.debMdl[mdlId]) return true
	const time = data.debMdl[mdlId].getTime() + (data.tDebPlc ?? 20000)
	const cur = new Date().getTime()
	// Время прошло: авария осталась
	if (cur >= time) {
		wrModule(buildingId, mdlId, msgM(buildingId, opt, 110))
		// delDebMdl(mdlId)
		return false
	}
	// Опрашиваем модуль
	return true
}

module.exports = { wrDebMdl, delDebMdl, timeout, delModule }
