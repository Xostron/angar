const extralrm = require('@control/auto/extralrm')
const {extra, extraClear} = require('@control/auto/extra')
const main = require('./main')

// Склад холодильник
function cold(building, obj, bdata) {
	if (building?.type !== 'cold') return
	// Доп функции
	const alr = runExtra(building, obj, bdata)
	// Алгоритм управления камерой
	main(building, obj, bdata, alr)
}

module.exports = cold

function runExtra(building, obj, bdata) {
	const { start, s, se, m, accAuto } = bdata
	let alr = false
	// Всегда
	alr = alr || extralrm(building, null, obj, s, se, m, null, null, 'cold', 'always')
	// console.log(222,alr)
	extra(building, null, obj, s, se, m, null, null, null, 'cold', 'always')

	// Склад выключен
	if (!start) {
		extra(building, null, obj, s, se, m, null, null, null, 'cold', 'off')
		return alr
	} else extraClear(building, null, obj, s, se, m, null, null, null, 'cold', 'off')

	// Склад включен
	extra(building, null, obj, s, se, m, null, null, null, 'cold', 'on')
	alr = alr || extralrm(building, null, obj, s, se, m, null, null, 'cold', 'on')
	return alr
}