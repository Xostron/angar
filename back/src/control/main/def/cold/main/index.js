const def = require('../def')
const { change, checkDefrost } = require('../fn')
const denied = require('./fn/denied')
const target = require('./fn/target')

// Комбинированный склад
function main(bld, obj, bdata, alr) {
	const { data, retain } = obj
	const { start, s, se, m, accAuto, supply } = bdata
	const fnChange = (sl, f, h, add, code) => change(bdata, bld._id, sl, f, h, add, code)
	if (bld?.type==='combi') accAuto.cold ??= {}
	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		// console.log(`\nСклад: ${bld?.name} Секция: ${sect?.name} [${sect?.buildingId}, ${sect?._id}] `)
		const stateCooler = obj.value?.[m?.cold?.cooler?.[0]?._id]
		// console.log('\tРежим:', stateCooler?.state, stateCooler?.name)
		// Работа склада запрещена
		if (denied(bld, bdata, alr, stateCooler, fnChange)) continue

		// Работа склада разрешена
		// Вычисление Т target
		target[bld?.type](bld, obj, bdata, alr)

		// console.log('\tТмп. задания на сутки', se.cooler.tprd, '-', s.cold.decrease, '=', accAuto.target, 'от', accAuto.targetDT.toLocaleString())
		// Выключена ли оттайка
		if (!checkDefrost(fnChange, accAuto, se, s, stateCooler.state, stateCooler)) def?.[stateCooler.state](fnChange, accAuto, se, s, bld)
	}
}

module.exports = main
