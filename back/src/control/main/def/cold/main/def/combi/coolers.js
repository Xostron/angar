const checkDefrost = require('../../fn/check')
const cooler = require('../../def_cooler')
const denied = require('../../fn/denied')
const { initSoftsol } = require('../../fn/change/soft_solenoid')
/**
 * Склад Комби: Логика испарителей
 * @param {object} bld Склад
 * @param {object} sect Секция
 * @param {object} bdata Данные по конкретному складу
 * @param {object[]} seS Датчики секции
 * @param {object} mS Исполнительные механизмы секции
 * @param {boolean} alr Сигнал аварии (extralrm по складу)
 * @param {function} fnChange Функция вкл/выкл узлов испарителя
 * @param {object} obj Глобальные данные склада
 */
function coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj) {
	const { data, retain } = obj
	const { start, s, se, m, accAuto, supply, automode } = bdata

	initSoftsol(accAuto, sect, mS.coolerS, s)

	// console.log(111, accAuto.cold.softSol)
	for (const clr of mS.coolerS) {
		console.log('-----------------------------------------------------------------------')
		accAuto.cold[clr._id] ??= {}
		accAuto.cold[clr._id].state ??= {}

		const stateCooler = obj.value?.[clr._id]
		// console.log('\t', 5551, 'состояние испарителя', stateCooler)
		// Режим секции true-Авто
		const sectM = retain?.[bld._id]?.mode?.[sect._id]
		if (denied.combi(bld, sect, clr, sectM, bdata, alr, stateCooler, fnChange, obj)) continue

		const seClr = { ...seS, cooler: {} }
		seClr.cooler = seS.cooler[clr._id]
		// Проверка выключена ли оттайка -> оттайка выключена -> управление испарителем
		if (
			!checkDefrost.combi(
				fnChange,
				accAuto.cold,
				accAuto.cold[clr._id],
				seClr,
				s,
				stateCooler.state,
				clr
			)
		)
			cooler.combi?.[stateCooler.state](
				fnChange,
				accAuto.cold,
				accAuto.cold[clr._id],
				seClr,
				s,
				bld,
				clr
			)
	}
	console.log('-----------------------------------------------------------------------')
}

module.exports = coolers
