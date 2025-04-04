const normal = require('../normal')
const cold = require('../cold')

// Комбинированный склад (простой склад+холодильник с некоторыми особенностями)
function combi(building, obj, bdata) {
	const { start, automode, s, se: seB, m, accAuto, resultFan } = bdata
	console.log(111, 'Комбинированный холодильный склад', building?.type)
	console.log('\tЗапущен', start)
	console.log('\tАвторежим', automode)
	console.log('\Аккумулятор', accAuto)
	// Простой склад
	normal(building, obj, bdata)
	// Холодильник (включение при аварии авторежима)
	cold(building, obj, bdata)
}

module.exports = combi
