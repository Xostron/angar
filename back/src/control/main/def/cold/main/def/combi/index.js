const defrostAll = require('@tool/combi/defrost_drain')
const { clearBuild } = require('../../fn/denied/fn')
const { sensor } = require('@tool/command/sensor')
const { oneChange } = require('../../fn/change')
const { mech } = require('@tool/command/mech')
const denied = require('../../fn/denied')
const target = require('../../fn/tgt')
const coolers = require('./coolers')
const fanCombi = require('./fan')

// Комбинированный - холодильник
function main(bld, obj, bdata, alr) {
	const { data } = obj
	const { start, automode, s, se, m, accAuto } = bdata

	// Управление испарителем
	const fnChange = (sl, f, h, add, code, clr) =>
		oneChange(bdata, bld._id, sl, f, h, add, code, clr)

	// Синхронизация оттайки-слива_воды испарителей
	defrostAll(accAuto.cold, m.cold.cooler, obj)

	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		// Исполнительные механизмы камеры
		const mS = mech(obj, sect._id, sect.buildingId)
		// Показания с датчиков секции
		const seS = sensor(bld._id, sect._id, obj)
		// Работа испарителей
		coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj)
		if (denied.section(bld, sect, bdata, alr, obj)) continue
		// Работа ВНО секции и TODO соленоида подогрева (регулирование температурой канала)
		fanCombi(bld, sect, bdata, obj, s, se, seS, m, mS, alr, accAuto.cold)
	}
	if (clearBuild(bld, bdata.accAuto)) {
		// Работа склада разрешена -> Вычисление Т target
		// console.log(999)
		target.combi(bld, obj, bdata, alr)
	}
}

module.exports = main

