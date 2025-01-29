const { arrCtrl } = require('@tool/command/fan')
const { compareTime } = require('@tool/command/time')
const { data: store, delExtra, wrExtra } = require('@store')
const { msgB } = require('@tool/message')

// Оттайка слива воды: Вкл
function on(building, arr, value, acc) {
	arrCtrl(building._id, arr, 'on')
	if (!acc?.on) {
		acc.on = true
		acc.off = false
		delExtra(building._id, null, 'drainRun')
		wrExtra(building._id, null, 'drainRun', {
			date: new Date(),
			...msgB(building, 71),
		})
	}
}

// Оттайка слива воды: Выкл
function off(building, arr, value, acc) {
	arrCtrl(building._id, arr, 'off')
	if (!acc?.off) {
		acc.off = true
		acc.on = false
		delExtra(building._id, null, 'drainRun')
		wrExtra(building._id, null, 'drainRun', {
			date: new Date(),
			...msgB(building, 72),
		})
	}
}

// Оттайка слива воды: авто
function auto(building, arr, value, acc, se, s, m) {
	const stateCooler = value?.[m?.cold?.cooler?.[0]?._id]?.state
	const defrost = stateCooler == 'off-off-on'
	const drain = stateCooler == 'off-off-off-add'
	defrost || drain ? on(building, arr, value, acc) : off(building, arr, value, acc)
}

// TODO Температура улицы от API погоды
// Оттайка слива воды: По температуре
function temp(building, arr, value, acc, se, s) {}

module.exports = {
	on,
	off,
	auto,
	temp,
}
