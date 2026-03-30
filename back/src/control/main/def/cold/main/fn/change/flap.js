const { ctrlDO } = require("@tool/command/module_output")

/**
 * Вкл/Выкл заслонок
 * @param {*} idB ИД склада
 * @param {*} flap Массив заслонок
 * @param {*} accCold Аккумулятор комби-холода
 * @param {*} isCN Склад в режиме комби-холодильника
 */
function ctrlFlap(idB, idClr, flap = [], accCold, isCN = true) {
	// TODO old: Заслонка оттайки (открывается при оттайке и сливе воды)
	// const flapOn = isCombiCold(bld,automode,s) && (accAuto.cold.defrostAll || accAuto.cold.defrostAllFinish || accAuto.cold.drainAll)

	// TODO new:Заслонка оттайки (открывается при оттайке) ИЛИ
	// ИЛИ по флагу высокого давления (см. src\control\main\def\cold\main\fn\denied\def\pressure\action.js)
	const flapOn = (isCN && accCold?.defrostAll) || accCold?.[idClr]?.offPressure
	flap.forEach((el) => ctrlDO(el, idB, flapOn ? 'on' : 'off'))
}

module.exports = ctrlFlap
