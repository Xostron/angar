const { data } = require('@store')

// Записать в extra событие
function wrExtra(idB, idS, name, o, type) {
	data.alarm.extra ??= {}
	data.alarm.extra[idB] ??= {}
	if (!type) {
		if (!idS) {
			data.alarm.extra[idB][name] = o
			return
		}
		data.alarm.extra[idB][idS] ??= {}
		data.alarm.extra[idB][idS][name] = o
	} else {
		if (!idS) {
			data.alarm.extra[idB][name] ??= {}
			data.alarm.extra[idB][name][type] = o
			return
		}
		data.alarm.extra[idB][idS] ??= {}
		data.alarm.extra[idB][idS][name] ??= {}
		data.alarm.extra[idB][idS][name][type] = o
	}
}

// Записать в extra событие
function delExtra(idB, idS, name, type) {
	if (!type) {
		if (!idS) {
			delete data.alarm?.extra?.[idB]?.[name]
			return
		}
		delete data.alarm?.extra?.[idB]?.[idS]?.[name]
	} else {
		if (!idS) {
			delete data.alarm?.extra?.[idB]?.[name]?.[type]
			return
		}
		delete data.alarm?.extra?.[idB]?.[idS]?.[name]?.[type]
	}
}

function isExtra(idB, idS, code, type) {
	if (type)
		return idS
			? !!data.alarm?.extra?.[idB]?.[idS]?.[code]?.[type]
			: !!data.alarm?.extra?.[idB]?.[code]?.[type]
	return idS
		? !!data.alarm?.extra?.[idB]?.[idS]?.[code]
		: !!data.alarm?.extra?.[idB]?.[code]
}

module.exports = { wrExtra, delExtra, isExtra }
