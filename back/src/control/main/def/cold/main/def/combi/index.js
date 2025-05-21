const { clearBuild } = require('../../fn/denied/fn')
const { sensor } = require('@tool/command/sensor')
const { oneChange } = require('../../fn/change')
const { mech } = require('@tool/command/mech')
const target = require('../../fn/target')
const coolers = require('./coolers')
const skip = ['off-off-on', 'off-off-off-add']

// Комбинированный - холодильник
function main(bld, obj, bdata, alr) {
	const { data } = obj
	const { start, automode, s, se, m, accAuto, resultFan } = bdata

	// Управление испарителем
	const fnChange = (sl, f, h, add, code, clr) => oneChange(bdata, bld._id, sl, f, h, add, code, clr)
	// Проверка секции: на наличие хоть одного испарителя в
	// состоянии оттайки или стекания воды
	accAuto.cold.defrostAll = m.cold.cooler.some((el) => {
		return skip.includes(obj.value[el._id]?.state)
	})

	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		// Исполнительные механизмы камеры
		const mS = mech(obj.data, sect._id, sect.buildingId)
		// console.log(555, mS)
		// Показания с датчиков секции
		const seS = sensor(bld._id, sect._id, obj)
		// Работа испарителей
		coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj)
		// Работа ВНО
	}
	if (clearBuild(bld._id, bdata.accAuto)) {
		// Работа склада разрешена -> Вычисление Т target
		target.combi(bld, obj, bdata, alr)
	}
}

module.exports = main
