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

	// TODO new:Закрыть заслонку - true
	// - при оттайке
	// - по флагу высокого давления (см. src\control\main\def\cold\main\fn\denied\def\pressure\action.js)
	// - внешний доп сигнал
	// - выведен из работы испаритель
	const flapClose =
		(isCC && accCold?.defrostAll) ||
		accCold?.[clr._id]?.offPressure ||
		fl ||
		fansOff(idB, clr, obj.retain)

	// console.log(
	// 	2211,
	// 	clr.name,
	// 	isCC && accCold?.defrostAll,
	// 	accCold?.[clr._id]?.offPressure,
	// 	fl,
	// 	fansOff(idB, clr, obj.retain),
	// )
	flap.forEach((el) => {
		// Тип заслонки: hasOpen=true заслонка-клапан
		const flapSig = flapVlvSig(el, obj?.data?.signal)

		if (flapSig.hasOpen) {
			// Заслонка клапан
			if (flapClose) {
				// Закрыть
				ctrlDO(el, idB, 'on')
				ctrlDO(flapSig?.signals?.open, idB, 'off')
			} else {
				// Открыть
				ctrlDO(flapSig?.signals?.open, idB, 'on')
				ctrlDO(el, idB, 'off')
			}
		} else {
			// Заслонка обычная
			if (flapClose) {
				// Закрыть
				ctrlDO(el, idB, 'on')
			} else {
				// Открыть

				ctrlDO(el, idB, 'off')
			}
		}
	})
}

module.exports = ctrlFlap
