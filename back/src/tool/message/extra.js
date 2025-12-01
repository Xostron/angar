const { data } = require('@store')

// Записать в extra событие
function wrExtra(idB, idS, name, o, type) {
	data.alarm.extra ??= {}
	data.alarm.extra[idB] ??= {}
	if (!type) {
		if (!idS) {
			!isExtra(idB, idS, name, type)
				? (data.alarm.extra[idB][name] = o)
				: (data.alarm.extra[idB][name].msg = o.msg)
			return
		}
		data.alarm.extra[idB][idS] ??= {}
		!isExtra(idB, idS, name, type)
			? (data.alarm.extra[idB][idS][name] = o)
			: (data.alarm.extra[idB][idS][name].msg = o.msg)
	} else {
		if (!idS) {
			data.alarm.extra[idB][name] ??= {}
			!isExtra(idB, idS, name, type)
				? (data.alarm.extra[idB][name][type] = o)
				: (data.alarm.extra[idB][name][type].msg = o.msg)
			return
		}
		data.alarm.extra[idB][idS] ??= {}
		data.alarm.extra[idB][idS][name] ??= {}
		!isExtra(idB, idS, name, type)
			? (data.alarm.extra[idB][idS][name][type] = o)
			: (data.alarm.extra[idB][idS][name][type].msg = o.msg)
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

function isExtra(idB, idS, name, type) {
	if (type)
		return idS
			? !!data.alarm?.extra?.[idB]?.[idS]?.[name]?.[type]
			: !!data.alarm?.extra?.[idB]?.[name]?.[type]
	return idS ? !!data.alarm?.extra?.[idB]?.[idS]?.[name] : !!data.alarm?.extra?.[idB]?.[name]
}

function getDTextra(idB, idS, code, type) {
	if (type)
		return idS
			? data.alarm?.extra?.[idB]?.[idS]?.[code]?.[type]?.date ?? ''
			: data.alarm?.extra?.[idB]?.[code]?.[type]?.date ?? ''
	return idS
		? data.alarm?.extra?.[idB]?.[idS]?.[code]?.date ?? ''
		: data.alarm?.extra?.[idB]?.[code]?.date ?? ''
}

module.exports = { wrExtra, delExtra, isExtra, getDTextra }
