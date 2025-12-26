const { data: store, readAcc } = require('@store')

// Расчет задания
// Для холодильника
// accAuto - аккумулятор холодильника
function coldTarget(bld, obj, bdata, alr) {
	const { start, s, se, m, accAuto, supply } = bdata
	const { tprd } = se
	// Начать расчет задания: Нет расчета задания || Полночь || Оператор изменил настройки (Уменьшение темп в день, минимальное задание)
	if (!accAuto.targetDT || accAuto.targetDT.getDate() !== new Date().getDate() || accAuto?.isChange(s.cold.decrease, s.cold.target)) {
		// Указанные настройки изменились?
		accAuto.isChange = isChange(s.cold.decrease, s.cold.target)
		// Температура задания на сутки (decrease мб равен 0) по минимальной тмп. продукта
		const t = tprd - s.cold.decrease
		accAuto.target = +(t <= s.cold.target || s.cold.decrease === 0 ? s.cold.target : t).toFixed(1)

		// Время создания задания
		accAuto.targetDT = new Date()
	}
}

// Аккумулятор комбинированного склада accTotal = {...данные_нормального_склада, cold:{...данные холодильника}}
// Для комбинированного
function combiTarget(bld, obj, bdata, alr) {
	const { start, s, se, m, accAuto, supply, automode } = bdata


	// TODO3 Для комби холодильника рассчитывать свое задание канала
	const name = bld?.type == 'normal' ? automode ?? bld?.type : bld?.type
	const r = readAcc(bld._id, name)
	accAuto.cold.tgtTcnl = r?.tcnl
	// console.log(9900, accAuto.cold.tgtTcnl, r?.tcnl, se.tprd, accAuto.tcnl)
	// accAuto.cold.tgtTcnl = se.tprd - accAuto.setting.cooling.differenceValue
	
	// Начать расчет задания: Нет расчета задания || Полночь || Оператор изменил настройки (Т задания, Уменьшение температуры в день)
	if (!accAuto.cold.targetDT || accAuto.cold.targetDT.getDate() !== new Date().getDate() || accAuto.cold?.isChange(s.cooling.decrease, s.cooling.target)) {
		// Указанные настройки изменились?
		accAuto.cold.isChange = isChange(s.cooling.decrease, s.cooling.target)
		// Температура задания продукта с нормального склада
		// Температура задания на сутки (decrease мб равен 0) по минимальной тмп. продукта
		accAuto.cold.tgtTprd = r?.tgt
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
