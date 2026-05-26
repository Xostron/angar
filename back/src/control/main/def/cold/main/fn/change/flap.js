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
function ctrlFlap(idB, clr, flap = [], accCold, retain, fl = false, isCC = true) {
	// TODO old: Заслонка оттайки (открывается при оттайке и сливе воды)
	// const flapOn = isCombiCold(bld,automode,s) && (accAuto.cold.defrostAll || accAuto.cold.defrostAllFinish || accAuto.cold.drainAll)

	// TODO new:Заслонка оттайки открывается^
	// - при оттайке
	// - по флагу высокого давления (см. src\control\main\def\cold\main\fn\denied\def\pressure\action.js)
	// - внешний доп сигнал
	// - выведен из работы испаритель
	const flapOn =
		(isCC && accCold?.defrostAll) ||
		accCold?.[clr._id]?.offPressure ||
		fl ||
		fansOff(idB, clr, retain)
	flap.forEach((el) => ctrlDO(el, idB, flapOn ? 'on' : 'off'))
}

module.exports = ctrlFlap
