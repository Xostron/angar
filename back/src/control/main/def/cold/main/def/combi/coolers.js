const { change, checkDefrost } = require('../../fn/check')
const cooler = require('../../def_cooler')
const target = require('../../fn/target')
const denied = require('../../fn/denied')
const { mech } = require('@tool/command/mech')
const { sensor } = require('@tool/command/sensor')
const { checkCombiCold } = require('@tool/command/section')

/**
 * Работа каждого из испарителей в секции
 * @param {*} bld Склад
 * @param {*} sect Секция
 * @param {*} obj Глобальные данные склада
 * @param {*} bdata Данные по конкретному складу
 * @param {*} seS Датчики камеры
 * @param {*} meS Исполнительные механизмы камеры
 * @param {*} alr сигнал аварии (extralrm по складу)
 */
function coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj) {
	const { data, retain } = obj
	const { start, s, se, m, accAuto, supply, automode } = bdata

	for (const clr of mS.coolerS) {
		// if (clr.sectionId != sect._id) continue
		// console.log(`\t ${clr.name}: Склад: ${bld?.name} Секция: ${sect?.name} [${sect?.buildingId}, ${sect?._id}] `)
		accAuto.cold[clr._id] ??= {}
		// Проверка секции (Если условия для авто не подходят, то ничего не делаем)
		// if (!checkCombiCold(bld._id, sect, obj, automode, start)) {
		// 	console.log(55, clr.name,'не в работе', sect.name, )
		// 	if (!accAuto.cold[clr._id].once) fnChange(clr._id, 0, 0, 0)
		// 	accAuto.cold[clr._id].once = true
		// 	continue
		// }
		// console.log(55, clr.name,'в работе', sect.name, clr.name)

		const stateCooler = obj.value?.[m?.cold?.cooler?.[0]?._id]
		// console.log('\tРежим:', stateCooler?.state, stateCooler?.name)

		// Режим секции true-Авто
		const sectM = retain[bld._id].mode[sect._id]
		if (denied.combi(bld, sect, clr, sectM, bdata, alr, stateCooler, fnChange, obj)) continue

		// Работа склада разрешена
		// Вычисление Т target
		// target.combi(bld, obj, bdata, alr)
		// console.log('\tТмп. задания на сутки', se.cooler.tprd, '-', s.cold.decrease, '=', accAuto.target, 'от', accAuto.targetDT.toLocaleString())

		// Выключена ли оттайка
		// if (!checkDefrost(fnChange, accAuto, se, s, stateCooler.state, stateCooler)) cooler.combi?.[stateCooler.state](fnChange, accAuto, se, s, bld)

		// TODO Функции комбинированного склада
	}
}

module.exports = coolers
