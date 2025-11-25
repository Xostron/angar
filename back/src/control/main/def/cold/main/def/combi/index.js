const defrostAll = require('@tool/combi/defrost_drain')
const { clearBuild } = require('../../fn/denied/fn')
const { sensor } = require('@tool/command/sensor')
const { oneChangeCombi } = require('../../fn/change')
const { mech } = require('@tool/command/mech')
const target = require('../../fn/tgt')
const coolers = require('./coolers')
const fanCombi = require('./fan')

// Комбинированный - холодильник
function main(bld, obj, bdata, alr) {
	const { data } = obj
	const { start, automode, s, se, m, accAuto } = bdata

	// Управление испарителем
	const fnChange = (sl, f, h, add, code, clr) =>
		oneChangeCombi(bdata, bld._id, sl, f, h, add, code, clr)

	// Синхронизация оттайки-слива_воды испарителей
	defrostAll(bld._id, accAuto.cold, m.cold.cooler, obj, s)

	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		// Исполнительные механизмы камеры
		const mS = mech(obj, sect._id, sect.buildingId)
		// Показания с датчиков секции
		const seS = sensor(bld._id, sect._id, obj)
		// Работа испарителей
		coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj)
	}
	// Управление ВНО
	fanCombi(bld, bdata, obj, s, se, m, alr, accAuto.cold)
	//
	if (clearBuild(bld, bdata.accAuto)) {
		// Работа склада разрешена -> Вычисление Т target
		target.combi(bld, obj, bdata, alr)
	}
	console.log(88, 'Аккумулятор холодильника')
	console.log(accAuto.cold)
}

module.exports = main

// function consoleTable(accCold, m, section) {
// 	console.table(
// 		[
// 			{
// 				'defrostAll(Оттайка_начало)': accCold.defrostAll,
// 				'defrostAllFinish(Оттайка_окончена)': accCold.defrostAllFinish,
// 			},
// 		],
// 		['defrostAll(Оттайка_начало)', 'defrostAllFinish(Оттайка_окончена)']
// 	)
// 	console.table(
// 		[
// 			{
// 				'drainAll(Слив_воды_окончен)': accCold.drainAll,
// 				'afterD(Ожидание_после_слива)': accCold.afterD,
// 				'timeAD(Время_после_слива)': accCold.timeAD,
// 			},
// 		],
// 		['drainAll(Слив_воды_окончен)', 'afterD(Ожидание_после_слива)', 'timeAD(Время_после_слива)']
// 	)
// 	console.table(
// 		[
// 			{
// 				tgtTcnl: accCold.tgtTcnl,
// 				tgtTprd: accCold.tgtTprd,
// 				targetDT: accCold.targetDT,
// 			},
// 		],
// 		['tgtTcnl', 'tgtTprd', 'targetDT']
// 	)
// 	m.cold.cooler.forEach((el) => {
// 		const sect = section.find((sec) => sec._id === el.sectionId)
// 		console.log('\x1b[36m%s\x1b[0m', el.name, sect.name)
// 		console.table(accCold?.[el._id])
// 	})
// }
