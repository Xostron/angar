const normal = require('../normal')
const cold = require('../cold')

// Комбинированный склад (простой склад+холодильник с некоторыми особенностями)
function combi(building, obj, bdata) {
	if (building?.type !== 'combi') return
	const { start, automode, s, se:seB, m, accAuto, resultFan } = bdata
	console.log(111, 'Комбинированный холодильный склад', seB)
	// console.log(se)
	// Простой склад
	normal(building, obj, bdata)
	// Холодильник (включение при аварии авторежима)
	cold(building, obj, bdata)
}

module.exports = combi