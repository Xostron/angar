const normal = require('../normal')
const cold = require('../cold')

// Комбинированный склад (простой склад+холодильник с некоторыми особенностями)
function combi(building, obj, bdata) {
	const { start, automode, s, se: seB, m, accAuto, resultFan } = bdata
	console.log(111, 'Комбинированный холодильный склад', building?.type)
	console.log('\tСклад включен', start)
	console.log('\tАвторежим', automode)
	console.log('\tАккумулятор', accAuto)
	// Простой склад (см. папку normal)
	normal(building, obj, bdata)
	accAuto.cold ??= { test: 0 }
	// accAuto.cold.test ??= 0
	accAuto.cold.test++
	console.log(5555, accAuto)
	// Холодильник (включение при аварии авторежима)
	cold(building, obj, bdata)
	console.log(55555, accAuto)
}

module.exports = combi
