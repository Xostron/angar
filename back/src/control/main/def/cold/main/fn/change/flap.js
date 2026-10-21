const { flapVlvSig } = require('@root/control/analysis/value/periphery/fn/output_eq/fn')
const { ctrlDO } = require('@tool/command/module_output')
const { fansOff } = require('@tool/cooler')

/**
 *
 * @param {*} idB ИД склада
 * @param {*} idClr ИД испарителя
 * @param {*} flap Массив заслонок
 * @param {*} accCold Аккумулятор
 * @param {*} fl Доп сигнал управления
 * @param {*} isCC Режим комби-холод (по-умолчанию)
 */
function ctrlFlap(idB, clr, flap = [], accCold, obj, fl = false, isCC = true) {
	// TODO old: Заслонка оттайки (открывается при оттайке и сливе воды)
	// const flapOn = isCombiCold(bld,automode,s) && (accAuto.cold.defrostAll || accAuto.cold.defrostAllFinish || accAuto.cold.drainAll)

	// TODO new:Открыть заслонку - tue
	// - при оттайке
	// - по флагу высокого давления (см. src\control\main\def\cold\main\fn\denied\def\pressure\action.js)
	// - внешний доп сигнал
	// - выведен из работы испаритель
	const flapOn =
		(isCC && accCold?.defrostAll) ||
		accCold?.[clr._id]?.offPressure ||
		fl ||
		fansOff(idB, clr, obj.retain)
	flap.forEach((el) => {
		if (flapOn) {
			// Открыть заслонку
			ctrlDO(el, idB, 'on')
			return
		}
		// Поиск сигнала закрытия заслонки
		const flapSig = flapVlvSig(el, obj?.data?.signal)
		// console.log(11, flapSig?.signals?.close)
		// Закрыть заслонку
		if (!flapSig.hasClose) ctrlDO(el, idB, 'off')
		else {
			// Сигнал закрытия существует - закрываем
			ctrlDO(flapSig?.signals?.close, idB, 'on')
		}
	})
}

module.exports = ctrlFlap
