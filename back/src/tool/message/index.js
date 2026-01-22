const mes = require('@dict/message')
const { v4: uuidv4 } = require('uuid')

// Сообщение для журнала событий

// Секции
function msg(building, section, code, msg = '') {
	const o = { ...mes[code] }
	o.title = section?.name ? `${section?.name}:` : ''
	o.msg = msg ? o.msg + ' ' + msg : o.msg
	o.buildingId = building._id
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')
	return o
}
// Склада
function msgB(building, code, msg = '') {
	const o = { ...mes[code] }
	o.title = ``
	o.buildingId = building._id
	o.msg = msg ? o.msg + ' ' + msg : o.msg
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')
	return o
}
// Клапана
function msgV(building, section, typeV, code) {
	const o = { ...mes[code] }
	o.title = section?.name ? `${section?.name}. ` : ''
	o.title += typeV ? `${typeV} клапан:` : ''
	o.buildingId = building._id
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')
	return o
}
// Вентиляторы
function msgF(building, section, name, code) {
	const o = { ...mes[code] }
	o.title = `${section.name ?? ''}. ${name ?? ''}:`
	o.buildingId = building._id
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')
	return o
}
// Датчики
function msgBS(building, section, sensor, code) {
	const o = { ...mes[code] }
	o.title = section == 'sensor' ? `${sensor?.name}:` : `${section?.name}. ${sensor?.name}:`
	if (!sensor) o.title = section == 'sensor' ? '' : `${section?.name}.`
	o.buildingId = building._id
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')
	return o
}
// Модули
function msgM(buildingId, mdl, code) {
	const o = { ...mes[code] }
	if (mdl.interface == 'tcp')
		o.title = `Модуль ${mdl.name} (IP ${mdl.ip ?? ''}:${mdl.port ?? ''}):`
	else o.title = `Модуль ${mdl.name} (${mdl.ip ?? ''}-${mdl.port ?? ''}):`
	o.buildingId = buildingId
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')

	return o
}

// Аварийные сообщения beep
function msgBeep(building, beep, name = '', alarm = true) {
	// const o = mes[code].find((el) => el.code === beep.code)
	const o = { code: beep.code, typeSignal: alarm ? 'critical' : 'info', msg: beep.name }
	o.title = name ? `${name}:` : ''
	o.buildingId = building._id
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')
	return o
}

function msgBB(building, code, msgBeg = '', msgEnd = '') {
	const o = { ...mes[code] }
	o.title = ``
	o.buildingId = building._id
	o.msg = msgBeg ? msgBeg + ' ' + o.msg : o.msg
	o.msg = msgEnd ? o.msg + ' ' + msgEnd : o.msg
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')
	return o
}

function msgClr(building, coolers = [], idClr, code, msg = '') {
	const o = { ...mes[code] }
	const clr = coolers.find((el) => el._id === idClr)
	o.title = clr?.name ? `${clr.name}.` : ''
	o.buildingId = building._id
	o.msg = msg ? o.msg + ' ' + msg : o.msg
	o.uid = uuidv4()
	o.date = new Date().toLocaleString('ru')
	return o
}

module.exports = { msg, msgB, msgV, msgF, msgBS, msgM, msgBeep, msgBB, msgClr }
