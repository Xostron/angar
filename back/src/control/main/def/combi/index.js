const normal = require('../normal')
const cold = require('../cold')

// Комбинированный склад (простой склад+холодильник с некоторыми особенностями)
function combi(building, obj, bdata) {
	const { start, automode, s, se: seB, m, accAuto, resultFan } = bdata
	console.log(111, 'Комбинированный холодильный склад', building?.type)
	console.log('\tСклад включен', start)
	console.log('\tАвторежим', automode)
	// console.log('\tАккумулятор', accAuto)
	// Аккумулятор комбинированного склада (холодильник)
	accAuto.cold ??= { test: 0 }
	accAuto.cold.test++
	// Простой склад (см. папку normal)
	console.log(11, 'ОБЫЧНЫЙ ====================')
	normal(building, obj, bdata)
	// Холодильник (включение при аварии авторежима)
	console.log(11, 'ХОЛОД ====================')
	cold(building, obj, bdata)
}

module.exports = combi
