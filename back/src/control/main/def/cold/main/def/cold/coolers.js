const checkDefrost = require('../../fn/check')
const cooler = require('../../def_cooler')
const denied = require('../../fn/denied')

function coolers(bld, sect, bdata, seS, mS, alr, fnChange, obj) {
	const { data, retain } = obj
	const { start, s, se, m, accAuto, supply, automode } = bdata

	for (const clr of mS.coolerS) {
		console.log('------------------------------------------------------------------------------')
		accAuto[clr._id] ??= {}
		accAuto[clr._id].state ??= {}
		// Состояние испарителя
		const stateCooler = obj.value?.[clr._id]
		console.log('Режим:', stateCooler?.state, stateCooler?.name)
		// Работа склада запрещена

		if (denied.cold(bld, sect, clr, bdata, alr, stateCooler, fnChange, obj)) continue

		const seClr = { ...seS, cooler: {} }
		seClr.cooler = seS.cooler[clr._id]


		// Выключена ли оттайка
		if (!checkDefrost.cold(fnChange, accAuto, accAuto[clr._id], seClr, s, stateCooler.state, clr))
			cooler.cold?.[stateCooler.state](fnChange, accAuto,accAuto[clr._id], seClr, s, bld, clr)
		console.log('------------------------------------------------------------------------------')
	}
}

module.exports = coolers
