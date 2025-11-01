const defrostAll = require('@tool/combi/defrost_drain')
const { clearBuild } = require('../../fn/denied/fn')
const { sensor } = require('@tool/command/sensor')
const { oneChange } = require('../../fn/change')
const { mech } = require('@tool/command/mech')
const target = require('../../fn/tgt')
const coolers = require('./coolers')

// Холодильник - алгоритм управления
function main(bld, obj, bdata, alr) {
	const { data, retain } = obj
	const { start, s, se: seB, m, accAuto, supply } = bdata

	const fnChange = (sl, f, h, add, code, clr) =>
		oneChange(bdata, bld._id, sl, f, h, add, code, clr)
	// Синхронизация оттайки-слива_воды испарителей
	defrostAll(bld._id, accAuto, m.cold.cooler, obj, s)
	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		const seS = sensor(bld._id, sect._id, obj)
		// Исполнительные механизмы камеры
		const mS = mech(obj, sect._id, sect.buildingId)
		// console.log(1111, seS, 11112, seB)
		// Работа испарителей
		coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj)
	}
	if (clearBuild(bld, bdata.accAuto)) {
		// Работа склада разрешена -> Вычисление Т target
		target.cold(bld, obj, bdata, alr)
	}
	console.log(88, 'Аккумулятор холодильника')
	console.log(accAuto)
	console.log('\n')
}

module.exports = main
