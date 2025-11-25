const build = require('./all/build')
const section = require('./all/section')
const fanAu = require('@tool/command/fan/auto')

// Простой склад
function normal(bld, obj, bdata) {
	// Данные по складу
	const { start, automode, s, se: seB, m, accAuto, resultFan } = bdata
	// СКЛАД: доп.функции - extra, доп. аварии - extralrm
	const { alrBld = false, alrAm = false } = build(
		start,
		bld,
		obj,
		s,
		seB,
		m,
		automode,
		accAuto,
		resultFan
	)
	// СЕКЦИИ: авторежимы, доп.функции - extra, доп. аварии - extralrm
	section(start, bld, obj, s, seB, automode, accAuto, resultFan, alrBld, alrAm)
	// Управление напорными вентиляторами
	fanAu.normal(bld, obj, s, seB, m, resultFan, bdata)
}

module.exports = normal
