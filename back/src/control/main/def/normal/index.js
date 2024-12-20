const build = require('@control/main/all/build')
const section = require('@control/main/all/section')
const { reset } = require('@store')
const { fan } = require('@control/main/all/fn')

// Простой склад
function normal(building, obj, bdata) {
	// Данные по складу
	const { start, automode, s, se, m, accAuto, resultFan } = bdata
	if (building?.type !== 'normal') return
	console.log(111, 'Простой склад')
	// СКЛАД: доп.функции - extra, доп. аварии - extralrm
	let alrB = build(start, building, obj, s, se, m, automode)
	// СЕКЦИИ: авторежимы, доп.функции - extra, доп. аварии - extralrm
	section(start, building, obj, s, automode, accAuto, resultFan, alrB, se)
	// Управление напорными вентиляторами
	fan(building, resultFan, s, obj)
	// Обнулить команду reset
	reset(building._id, false)
}

module.exports = normal
