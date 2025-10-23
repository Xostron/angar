const checkDefrost = require('../../fn/check')
const cooler = require('../../def_cooler')
const denied = require('../../fn/denied')

/**
 * Склад Холодильник: Логика испарителей
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

	for (const clr of mS.coolerS) {
		console.log(
			`\n----------------------------------${bld?.name} begin----------------------------------\n`
		)
		accAuto[clr._id] ??= {}
		accAuto[clr._id].state ??= {}
		// Состояние испарителя
		const stateCooler = obj.value?.[clr._id]
		// Работа склада запрещена

		if (denied.cold(bld, sect, clr, bdata, alr, stateCooler, fnChange, obj)) continue

		const seClr = { ...seS, cooler: {} }
		seClr.cooler = seS.cooler[clr._id]

		// Выключена ли оттайка
		if (
			!checkDefrost.cold(
				fnChange,
				accAuto,
				accAuto[clr._id],
				seClr,
				s,
				stateCooler.state,
				clr
			) &&
			cooler.cold?.[stateCooler?.state]
		)
			cooler.cold?.[stateCooler.state](
				fnChange,
				accAuto,
				accAuto[clr._id],
				seClr,
				s,
				bld,
				clr
			)
	}
	console.log(
		`\n----------------------------------${bld?.name} end----------------------------------`
	)
}

module.exports = coolers
