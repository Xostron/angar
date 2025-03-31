const extralrm = require('@control/extra/extralrm')
const { extra, extraClear } = require('@control/extra/extra')
const main = require('./main')

// Склад холодильник
function cold(building, obj, bdata) {
	console.log(222, '\tРабота холодильника', building?.type)
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

function check(building){
	if (building?.type==='cold') return true
	if (building?.type=='combi') return true
	
}