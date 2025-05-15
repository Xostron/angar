const { data: store, readAcc } = require('@store')

// Расчет задания
// Для холодильника
// accAuto - аккумулятор холодильника
function coldTarget(bld, sect, obj, bdata, se, alr) {
	const { start, s, se:seB, m, accAuto, supply } = bdata
	
	const clr = m.cold.cooler[0]
	const { tprd, co2 } = se.cooler
	const { tmpCooler } = se.cooler[clr._id]
	// console.log(tprd, co2, tmpCooler )

	// Начать расчет задания: Нет расчета задания || Полночь || Оператор изменил настройки (Уменьшение темп в день, минимальное задание)
	if (!accAuto.targetDT || accAuto.targetDT.getDate() !== new Date().getDate() || accAuto?.isChange(s.cold.decrease, s.cold.target)) {
		// Указанные настройки изменились?
		accAuto.isChange = isChange(s.cold.decrease, s.cold.target)
		// Температура задания на сутки (decrease мб равен 0) по минимальной тмп. продукта
		const t = tprd - s.cold.decrease
		accAuto.target = +(t <= s.cold.target || s.cold.decrease === 0 ? s.cold.target : t).toFixed(1)

		// Время создания задания
		accAuto.targetDT = new Date()
		accAuto.state ??= {}
	}
}

// Аккумулятор комбинированного склада accTotal = {...данные_нормального_склада, cold:{...данные холодильника}}
// Для комбинированного
function combiTarget(bld, obj, bdata, alr) {
	const { start, s, se, m, accAuto, supply, automode } = bdata

	console.log(999,accAuto.cold)

	// Начать расчет задания: Нет расчета задания || Полночь || Оператор изменил настройки (Уменьшение темп в день, минимальное задание)
	if (!accAuto.cold.targetDT || accAuto.cold.targetDT.getDate() !== new Date().getDate() || accAuto.cold?.isChange(s.cooling.target, s.cooling.decrease)) {
		// Указанные настройки изменились?
		accAuto.cold.isChange = isChange(s.cold.decrease, s.cold.target)
		const name = bld?.type == 'normal' ? automode ?? bld?.type : bld?.type
		// Температура задания продукта с нормального склада
		const r = readAcc(bld._id, name)
		const tgtTprd = readAcc(bld._id, name)?.tgt
		const tgtTcnl = readAcc(bld._id, name)?.tcnl
		// console.log(888, r)
		// Температура задания на сутки (decrease мб равен 0) по минимальной тмп. продукта
		accAuto.cold.tgtTprd = tgtTprd
		accAuto.cold.tgtTcnl = tgtTcnl
		// Время создания задания
		accAuto.cold.targetDT = new Date()
	}
}

module.exports = {
	cold: coldTarget,
	combi: combiTarget,
}

/**
 * Внешняя функция
 * @param  {number | string} hold Значения настроек исходные (замыкание)
 * @returns Внутрення функция
 * Внутрення функция
 * @param  {number | string} cur Значения настроек в цикле (текущие)
 * @returns {boolean} true - настройки изменены, false - настройки идентичны
 */
function isChange(...hold) {
	return (...cur) => {
		const holding = hold.join(' ')
		const current = cur.join(' ')
		return holding !== current
	}
}
