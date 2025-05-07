const { change, checkDefrost } = require('../../fn/check')
const cooler = require('../../def_cooler')
const target = require('../../fn/target')
const denied = require('../../fn/denied')
const { mech } = require('@tool/command/mech')
const { sensor } = require('@tool/command/sensor')
const {checkCold} = require('@tool/command/section')

// Комбинированный
function main(bld, obj, bdata, alr) {
	const { data } = obj
	const { start, automode, s, se: seB, m, accAuto, resultFan } = bdata
	// Аккумулятор: комбинированный склад
	// accAuto.cold ??= {}
	// Управление испарителем
	const fnChange = (sl, f, h, add, code) => change(bdata, bld._id, sl, f, h, add, code)

	// По камере
	for (sect of data.section) {
		if (sect.buildingId != bld._id) continue
		// Проверка секции (Если условия для авто не подходят, то ничего не делаем)
		if (!checkCold(bld._id, sect, obj, automode, start)) return // clear(accAuto)
		console.log(777777, 'Работа камеры холодильника', sect.name)
		// Исполнительные механизмы камеры
		const mS = mech(obj.data, sect._id, sect.buildingId)
		// Показания с датчиков секции
		const seS = sensor(bld._id, sect._id, obj)
		// Работа испарителей
		coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj)
		// Работа ВНО
	}
}

module.exports = main

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
	const { start, s, se, m, accAuto, supply } = bdata

	for (const clr of data.cooler) {
		if (clr.sectionId != sect._id) continue
		console.log(`\t ${clr.name}: Склад: ${bld?.name} Секция: ${sect?.name} [${sect?.buildingId}, ${sect?._id}] `)
		// accAuto.cold[clr._id] ??= {}
		// console.log(8888, accAuto)
		// const stateCooler = obj.value?.[m?.cold?.cooler?.[0]?._id]
		// console.log('\tРежим:', stateCooler?.state, stateCooler?.name)

		// Режим секции true-Авто
		// const sectM = retain[bld._id].mode[sect._id]
		// if (denied.combi(bld, sectM, bdata, alr, stateCooler, fnChange, obj)) continue

		// Работа склада разрешена
		// Вычисление Т target
		// target.combi(bld, obj, bdata, alr)
		// console.log('\tТмп. задания на сутки', se.cooler.tprd, '-', s.cold.decrease, '=', accAuto.target, 'от', accAuto.targetDT.toLocaleString())

		// Выключена ли оттайка
		// if (!checkDefrost(fnChange, accAuto, se, s, stateCooler.state, stateCooler)) cooler.combi?.[stateCooler.state](fnChange, accAuto, se, s, bld)

		// TODO Функции комбинированного склада
	}
}
