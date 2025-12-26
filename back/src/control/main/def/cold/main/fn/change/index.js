const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { softsol } = require('./soft_solenoid')
const { isCombiCold } = require('@tool/combi/is')
const _MAX_SP = 100
const _MIN_SP = 20

// Склад холодильник (пока без ступеней и без заслонки оттайки на 18.11.2025)
function oneChange(bdata, idB, sl, f, h, add, code, clr) {
	const { start, s, se, m, accAuto } = bdata
	const { solenoid, fan, heating } = clr

	// Управление механизмами
	solenoid.forEach((el) => ctrlDO(el, idB, sl ? 'on' : 'off'))
	// Ступенчатое управление соленоидами
	// softsol(idB, solenoid, sl, clr, accAuto)
	// ВНО испарителя
	fan.forEach((el) => {
		// f = null - означает игнорирование ВНО испарителя, разрешение на работу в обычном режиме комби склада
		if (f === null) return
		ctrlDO(el, idB, f ? 'on' : 'off')
		if (el?.ao?.id) f ? ctrlAO(el, idB, _MAX_SP) : ctrlAO(el, idB, _MIN_SP)
	})
	// Оттайка
	heating.forEach((el) => ctrlDO(el, idB, h ? 'on' : 'off'))
	// Доп состояние слива воды
	accAuto ??= {}
	accAuto[clr._id] ??= {}
	accAuto[clr._id].state ??= {}
	accAuto[clr._id].state.add = add ? new Date() : false
	// Обновление времени включения состояния
	if (code) accAuto[clr._id].state[code] = new Date()

	console.log('\tСмена режима ', clr.name, code, ' : ', sl, f, h, add)
}

// Для комбинированного (ступенчатое, заслонка оттайки)
function oneChangeCombi(bdata, bld, sl, f, h, add, code, clr) {
	const idB = bld._id
	const { start, s, se, m, accAuto, automode } = bdata
	const { solenoid, fan, heating, flap = [] } = clr
	// Склад работает в режиме комби-холодильника
	const isCN = isCombiCold(bld, automode, s)
	// Управление механизмами
	// Ступенчатое управление соленоидами
	softsol(idB, solenoid, sl, f, h, clr, accAuto)
	// ВНО испарителя
	fan.forEach((el) => {
		// f = null - означает игнорирование ВНО испарителя, разрешение на работу в обычном режиме комби склада
		if (f === null) return
		ctrlDO(el, idB, f ? 'on' : 'off')
		if (el?.ao?.id) f ? ctrlAO(el, idB, _MAX_SP) : ctrlAO(el, idB, _MIN_SP)
	})
	// Оттайка
	heating.forEach((el) => ctrlDO(el, idB, h ? 'on' : 'off'))
	// Заслонки
	ctrlFlap(idB, flap, accAuto.cold, isCN)
	// Доп состояние слива воды
	accAuto.cold ??= {}
	accAuto.cold[clr._id] ??= {}
	accAuto.cold[clr._id].state ??= {}
	accAuto.cold[clr._id].state.add = add ? new Date() : false
	// Обновление времени включения состояния
	if (code) accAuto.cold[clr._id].state[code] = new Date()

	console.log('\tСмена режима ', clr.name, code, ' : ', sl, f, h, add)
}

module.exports = { oneChange, oneChangeCombi, ctrlFlap }

/**
 * Вкл/Выкл заслонок
 * @param {*} idB ИД склада
 * @param {*} flap Массив заслонок
 * @param {*} accCold Аккумулятор комби-холода
 * @param {*} isCN Склад в режиме комби-холодильника
 */
function ctrlFlap(idB, flap = [], accCold, isCN = true) {
	// TODO: ИЗМЕНЕНО: Заслонка оттайки (работает при оттайке и сливе воды)
	// const flapOn = isCombiCold(bld,automode,s) && (accAuto.cold.defrostAll || accAuto.cold.defrostAllFinish || accAuto.cold.drainAll)
	// Заслонка оттайки (работает при оттайке)
	const flapOn = isCN && accCold.defrostAll
	console.log(2200, '*************************', flapOn, isCN)
	flap.forEach((el) => ctrlDO(el, idB, flapOn ? 'on' : 'off'))
}
