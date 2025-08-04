const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { softsol } = require('./soft_solenoid')

function oneChange(bdata, idB, sl, f, h, add, code, clr) {
	const { start, s, se, m, accAuto } = bdata
	const { solenoid, fan, heating } = clr

	// TODO Управление механизмами
	// solenoid.forEach((el) => ctrlDO(el, idB, sl ? 'on' : 'off'))
	// Ступенчатое управление соленоидами
	softsol(idB, solenoid, sl, clr, accAuto)
	// ВНО испарителя
	fan.forEach((el) => {
		// f = null - означает игнорирование ВНО испарителя, разрешение на работу в обычном режиме комби склада
		if (f === null) return
		ctrlDO(el, idB, f ? 'on' : 'off')
		if (el?.ao?.id) f ? ctrlAO(el, idB, 100) : ctrlAO(el, idB, 0)
	})
	// Оттайка
	heating.forEach((el) => ctrlDO(el, idB, h ? 'on' : 'off'))
	// Доп состояние слива воды
	accAuto[clr._id] ??= {}
	accAuto[clr._id].state ??= {}
	accAuto[clr._id].state.add = add ? new Date() : false
	// Обновление времени включения состояния
	if (code) accAuto[clr._id].state[code] = new Date()

	console.log('\tСмена режима ', clr.name, code, ' : ', sl, f, h, add)
}

module.exports = { oneChange }

// function change(bdata, idB, sl, f, h, add, code) {
// 	const { start, s, se, m, accAuto } = bdata
// 	if (!m?.cold?.cooler?.[0]) return
// 	const { solenoid, fan, heating } = m?.cold?.cooler?.[0]
// 	// TODO Управление механизмами
// 	solenoid.forEach((el) => ctrlDO(el, idB, sl ? 'on' : 'off'))
// 	fan.forEach((el) => ctrlDO(el, idB, f ? 'on' : 'off'))
// 	heating.forEach((el) => ctrlDO(el, idB, h ? 'on' : 'off'))
// 	// Доп состояние слива воды
// 	accAuto.state ??= {}
// 	accAuto.state.add = add ? new Date() : false
// 	// Обновление времени включения состояния
// 	if (code) accAuto.state[code] = new Date()

// 	console.log('\tСмена режима ', code, ' : ', sl, f, h, add)
// }
