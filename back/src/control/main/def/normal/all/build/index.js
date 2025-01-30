const extralrm = require('@control/extra/extralrm')
const {extra} = require('@control/extra/extra')
const tuneup = require('@tool/service/tune')

function build(start, building, obj, s, se, m, automode) {
	let alr = false
	// Build Always - всегда выполняются
	alr = alr || extralrm(building, null, obj, s, se, m, automode, null, 'building', 'always')
	extra(building, null, obj, s, se, m, null, null, null, 'building', 'always')
	
	// Склад включен
	if (start) {
		// Дополнительные аварии склада
		alr =  extralrm(building, null, obj, s, se, m, automode, null, 'building', 'on')
		// Дополнительные функции склада (Склад включен)
		extra(building, null, obj, s, se, m, null, null, null, 'building', 'on')
	} else {
		// Дополнительные функции склада (Склад выключен)
		extra(building, null, obj, s, se, m, null, null, null, 'building', 'off')
	}
	

	// Калибровка клапанов
	tuneup(obj)
	return alr
}

module.exports = build
