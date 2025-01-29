const build = require('./all/build')
const section = require('./all/section')
const  fan  = require('@tool/command/fan/auto')

// Простой склад
function normal(building, obj, bdata) {
	// Данные по складу
	const { start, automode, s, se, m, accAuto, resultFan } = bdata
	if (building?.type !== 'normal') return
	// СКЛАД: доп.функции - extra, доп. аварии - extralrm
	let alrB = build(start, building, obj, s, se, m, automode)
	// СЕКЦИИ: авторежимы, доп.функции - extra, доп. аварии - extralrm
	section(start, building, obj, s, automode, accAuto, resultFan, alrB, se)
	// Управление напорными вентиляторами
	fan(building, resultFan, s, obj)
}

module.exports = normal
