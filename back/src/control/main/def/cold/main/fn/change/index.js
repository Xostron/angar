const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
// const { softsol } = require('./soft_solenoid')
const { isCombiCold } = require('@tool/combi/is')
const ctrlFanClr = require('./fan_clr/fan_clr')
const ctrlFlap = require('./flap')
const _MIN_SP = 20

// Склад холодильник (пока без ступеней и без заслонки оттайки на 18.11.2025)
function oneChange(bdata, idB, sl, f, h, add, code, clr) {
	const { start, s, se, m, accAuto } = bdata
	const { solenoid, fan, heating } = clr
	const _MAX_SP = s.fan.maxsp ?? 100
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
	accAuto.cold ??= {}
	accAuto.cold[clr._id] ??= {}
	accAuto.cold[clr._id].state ??= {}
	accAuto.cold[clr._id].sp ??= {}
	const { solenoid, fan, heating, flap = [] } = clr
	const isCN = isCombiCold(bld, automode, s) // Склад работает в режиме комби-холодильника

	// Управление механизмами
	// Ступенчатое управление соленоидами
	// softsol(idB, solenoid, sl, f, h, clr, accAuto)

	// Включение всех соленоидов испарителя (null - игнор команды, 0 - выкл, 1 - вкл)
	sl !== null ? solenoid.forEach((el) => ctrlDO(el, idB, sl ? 'on' : 'off')) : null

	// ВНО испарителя (null - игнор команды, 0 - выкл, 1 - вкл)
	ctrlFanClr(idB, f, clr, s, se, accAuto.cold)

	// Оттайка
	h !== null ? heating.forEach((el) => ctrlDO(el, idB, h ? 'on' : 'off')) : null

	// Заслонки
	ctrlFlap(idB, clr._id, flap, accAuto.cold, isCN)

	// Доп состояние слива воды
	accAuto.cold[clr._id].state.add = add ? new Date() : false
	// Обновление времени включения состояния
	if (code) accAuto.cold[clr._id].state[code] = new Date()

	console.log('\t', 5555, 'Смена режима ', clr.name, code, ' = ', sl, f, h, add)
}

module.exports = { oneChange, oneChangeCombi, ctrlFlap }
