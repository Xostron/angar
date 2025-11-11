
const extralrm = require('@control/extra/extralrm')
const {extra} = require('@control/extra/extra')

function sectionAlways(bld, sect, obj, s, se, m, am, accAuto, resultFan, alrB) {
	// Секция: доп. аварии
	const alr = extralrm(bld, sect, obj, s, se, m, am, null, 'section', 'always')
	// Секция: Дополнительные функции авторежимов
	extra(bld, sect, obj, s, se, m, alr, resultFan, null, 'section', 'always')
	return alr
}

module.exports = sectionAlways
