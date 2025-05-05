const { change, checkDefrost } = require('../../fn/check')
const cooler = require('../../def_cooler')
const target = require('../../fn/target')
const denied = require('../../fn/denied')
const { sensor } = require('@tool/command/sensor')

// Холодильник - алгоритм управления
function main(bld, obj, bdata, alr) {
	const { data, retain } = obj
	const { start, s, se: seB, m, accAuto, supply } = bdata

	const fnChange = (sl, f, h, add, code) => change(bdata, bld._id, sl, f, h, add, code)

	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		const se = sensor(bld._id, sect._id, obj)
		const clrId = data.cooler.find((el) => el.sectionId == sect._id)?._id

		// Состояние испарителя
		const stateCooler = obj.value?.[m?.cold?.cooler?.[0]?._id]
		console.log('\tРежим:', stateCooler?.state, stateCooler?.name)

		// Работа склада запрещена
		// if (denied(bld, bdata, alr, stateCooler, fnChange, obj)) continue

		// Работа склада разрешена -> Вычисление Т target
		target.cold(bld, sect, obj, bdata, se, alr)
		console.log('\tТмп. задания на сутки', se.cooler.tprd, '-', s.cold.decrease, '=', accAuto.target, 'от', accAuto.targetDT.toLocaleString())

		// Выключена ли оттайка
		if (!checkDefrost(fnChange, accAuto, se, seB, s, stateCooler.state, stateCooler))
			cooler.cold?.[stateCooler.state](fnChange, accAuto, se, s, bld, clrId)
	}
}

module.exports = main
