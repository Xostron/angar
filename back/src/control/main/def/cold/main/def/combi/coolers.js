const checkDefrost = require('../../fn/check')
const cooler = require('../../def_cooler')
const denied = require('../../fn/denied')
// const { initSoftsol } = require('../../fn/change/soft_solenoid')
const { isAlr } = require('@tool/message/auto')
const { data: store } = require('@store')
const { isAllStarted } = require('@store/index')

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

	// initSoftsol(accAuto, sect, mS.coolerS, s)

	// console.log(`-------------------${bld?.name} begin-------------------`)
	for (const clr of mS.coolerS) {
		// Аккумулятор испарителя
		accAuto.cold[clr._id] ??= {}
		accAuto.cold[clr._id].state ??= {}
		// Состояние испарителя
		const stateCooler = obj.value?.[clr._id]
		// Проверка: Запрет работы испарителя
		// Комби: Флаг для отключения испарителя, true - все вспомагательные механизмы подогрева канала запущены -> можно отключать испаритель
		if (denied.combi(bld, sect, clr, bdata, alr, stateCooler, fnChange, obj) || isAllStarted(clr.sectionId))
			continue
		// Датчики секции и испарителя
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
				clr,
				bld,
			) &&
			cooler.combi?.[stateCooler?.state]
		)
			cooler.combi?.[stateCooler?.state](
				fnChange,
				accAuto.cold,
				accAuto.cold[clr._id],
				seClr,
				s,
				bld,
				clr,
			)
	}
	// Отключение запрещенных к работе испарителей с проверкой на дублирование ВНО
	// Есть ли аварии авторежим (да - разрешение работы холодильника, нет - запрет)
	const alrAuto = isAlr(bld._id, automode)
	// Режим секции true-Авто
	const sectM = retain?.[bld._id]?.mode?.[sect._id]
	denied.off(bld._id, mS, s, fnChange, accAuto, alrAuto, sectM)
	denied.offByTcnl(bld._id, mS, s, fnChange, accAuto, alrAuto, sectM)
	// console.log(`-------------------${bld?.name} end-------------------`)
}

module.exports = coolers
