const { v4: uuidv4 } = require('uuid')
// import { v4 as uuidv4 } from 'uuid'

const mes = { 110: { count: true, code: 'module', typeSignal: 'critical', msg: 'Нет связи' } }

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

module.exports = { msgM }
