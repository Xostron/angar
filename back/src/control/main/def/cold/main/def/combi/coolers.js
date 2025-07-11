const checkDefrost = require('../../fn/check')
const cooler = require('../../def_cooler')
const denied = require('../../fn/denied')


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
		console.log('------------------------------------------------------------------------------')
		accAuto.cold[clr._id] ??= {}
		accAuto.cold[clr._id].state ??= {}

		const stateCooler = obj.value?.[clr._id]

		// Режим секции true-Авто
		const sectM = retain?.[bld._id]?.mode?.[sect._id]
		if (denied.combi(bld, sect, clr, sectM, bdata, alr, stateCooler, fnChange, obj)) continue

		const seClr = { ...seS, cooler: {} }
		seClr.cooler = seS.cooler[clr._id]

		// Выключена ли оттайка -> оттайка выключена -> управление испарителем
		if (!checkDefrost.combi(fnChange, accAuto.cold, accAuto.cold[clr._id], seClr, s, stateCooler.state, clr))
			cooler.combi?.[stateCooler.state](fnChange, accAuto.cold, accAuto.cold[clr._id], seClr, s, bld, clr)
		console.log('------------------------------------------------------------------------------')
		// TODO Функции комбинированного склада
	}
}

module.exports = coolers
