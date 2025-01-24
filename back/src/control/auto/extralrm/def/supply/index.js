const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgB } = require('@tool/message')

// Питание в норме
function supply(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(building?._id, obj, 'supply')
	// Питание в норме
	if (sig === false && !acc.on) {
		delExtralrm(building._id, null, 'supply')
		acc.on=true
		acc.alarm = false
	}
	// Питания нет
	if (sig === true && !acc.alarm) {
		wrExtralrm(building._id, null, 'supply', { date: new Date(), ...msgB(building, 38) })
		acc.on=false
		acc.alarm = true
	}
	// return acc?.alarm ?? false
}

module.exports = supply
