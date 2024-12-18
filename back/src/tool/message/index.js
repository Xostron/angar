const mes = require('@dict/message')

// Сообщение для журнала событий

// Секции
function msg(building, section, code) {
	const o = { ...mes[code] }
	o.title = `${section?.name ?? ''}:`
	o.buildingId = building._id
	return o
}
// Склада
function msgB(building, code, msg='') {
	const o = { ...mes[code] }
	o.title = ``
	o.buildingId = building._id
	o.msg += msg
	return o
}
// Клапана
function msgV(building, section, typeV, code) {
	const o = { ...mes[code] }
	o.title = `${section.name ?? ''}. ${typeV ?? ''} клапан:`
	o.buildingId = building._id
	return o
}
// Вентиляторы
function msgF(building, section, name, code) {
	const o = { ...mes[code] }
	o.title = `${section.name ?? ''}. ${name ?? ''}:`
	o.buildingId = building._id
	return o
}
// Датчики
function msgBS(building, section, sensor, code) {
	const o = { ...mes[code] }
	o.title = section == 'sensor' ? `${sensor.name}:` : `${section?.name}. ${sensor.name}:`
	o.buildingId = building._id
	return o
}
// Модули
function msgM(buildingId, mdl, code) {
	const o = { ...mes[code] }
	if (mdl.interface == 'tcp') o.title = `Модуль ${mdl.name} (IP ${mdl.ip ?? ''}:${mdl.port ?? ''}):`
	else o.title = `Модуль ${mdl.name} (${mdl.ip ?? ''}-${mdl.port ?? ''}):`
	o.buildingId = buildingId
	return o
}

// Аварийные сообщения beep
function msgBeep(building, beep, name = '', alarm = true) {
	// const o = mes[code].find((el) => el.code === beep.code)
	const o = { code: beep.code, typeSignal: alarm ? 'critical' : 'info', msg: beep.name }
	o.title = name ? `${name}:` : ''
	o.buildingId = building._id
	return o
}

module.exports = { msg, msgB, msgV, msgF, msgBS, msgM, msgBeep }
