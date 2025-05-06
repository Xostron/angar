const build = require('./all/build')
const section = require('./all/section')
const fan = require('@tool/command/fan/auto')
const { data: store } = require('@store')
// Простой склад
function normal(building, obj, bdata) {
	console.log(1111, `\t${building?.type==='combi'? 'Комбинированный обычный':'Обычный'} склад - процесс`, building?.type)
	// Данные по складу
	const { start, automode, s, se:seB, m, accAuto, resultFan } = bdata
	// if (building?.type !== 'normal') return
	// СКЛАД: доп.функции - extra, доп. аварии - extralrm
	const { alrBld, alrAm } = build(start, building, obj, s, seB, m, automode, accAuto)
	// СЕКЦИИ: авторежимы, доп.функции - extra, доп. аварии - extralrm
	section(start, building, obj, s, automode, accAuto, resultFan, alrBld, alrAm, seB)
	// Управление напорными вентиляторами
	fan(building, obj, s, seB, m, resultFan)
}

module.exports = normal
