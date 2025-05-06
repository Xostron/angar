const { change, checkDefrost } = require('../../fn/check')
const cooler = require('../../def_cooler')
const target = require('../../fn/target')
const denied = require('../../fn/denied')

// Комбинированный
function main(bld, obj, bdata, alr) {
	const { data, retain } = obj
	const { start, s, se, m, accAuto, supply } = bdata
	// Аккумулятор: комбинированный склад
	if (bld?.type === 'combi') accAuto.cold ??= {}

	const fnChange = (sl, f, h, add, code) => change(bdata, bld._id, sl, f, h, add, code)

	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		console.log(444, sect.name)
		// console.log(`\nСклад: ${bld?.name} Секция: ${sect?.name} [${sect?.buildingId}, ${sect?._id}] `)
		const stateCooler = obj.value?.[m?.cold?.cooler?.[0]?._id]
		console.log('\tРежим:', stateCooler?.state, stateCooler?.name)

		// Работа Испарителей



		// Режим секции true-Авто
		const sectM = retain[bld._id].mode[sect._id]
		if (denied(bld, sectM, bdata, alr, stateCooler, fnChange, obj)) continue
		// Работа склада разрешена
		// Вычисление Т target
		target.combi(bld, obj, bdata, alr)
		console.log('\tТмп. задания на сутки', se.cooler.tprd, '-', s.cold.decrease, '=', accAuto.target, 'от', accAuto.targetDT.toLocaleString())

		// Выключена ли оттайка
		if (!checkDefrost(fnChange, accAuto, se, s, stateCooler.state, stateCooler)) cooler.combi?.[stateCooler.state](fnChange, accAuto, se, s, bld)

		// TODO Функции комбинированного склада
	}
}

module.exports = main

function cooler(bld, sect, obj, bdata, alr){
	const { data, retain } = obj

	for (const clr of data.cooler) {
		
	}
	// if (sect.buildingId != bld._id) continue

}