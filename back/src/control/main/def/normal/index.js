const build = require('./all/build')
const section = require('./all/section')
const fan = require('@tool/command/fan/auto')
const { data: store } = require('@store')
// Простой склад
function normal(building, obj, bdata) {
	console.log(1111, `\t${building?.type==='combi'? 'Комбинированный обычный':'Обычный'} склад - процесс`, building?.type)
	// Данные по складу
	const { start, automode, s, se, m, accAuto, resultFan } = bdata
	// if (building?.type !== 'normal') return
	// СКЛАД: доп.функции - extra, доп. аварии - extralrm
	const { alrBld, alrAm } = build(start, building, obj, s, se, m, automode, accAuto)
	// СЕКЦИИ: авторежимы, доп.функции - extra, доп. аварии - extralrm
	section(start, building, obj, s, automode, accAuto, resultFan, alrBld, alrAm, se)
	// Управление напорными вентиляторами
	fan(building, obj, s, se, m, resultFan)
}

module.exports = normal
