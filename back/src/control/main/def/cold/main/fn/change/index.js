const { ctrlDO } = require('@tool/command/module_output')

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

function oneChange(bdata, idB, sl, f, h, add, code, clr) {
	const { start, s, se, m, accAuto } = bdata
	const { solenoid, fan, heating } = clr

	// TODO Управление механизмами
	solenoid.forEach((el) => ctrlDO(el, idB, sl ? 'on' : 'off'))
	fan.forEach((el) => {
		// f = null - означает игнорирование ВНО испарителя, разрешение на работу в обычном режиме комби склада
		console.log(777, el.name, el._id)
		if (f === null) return
		ctrlDO(el, idB, f ? 'on' : 'off')
	})
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
