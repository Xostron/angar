const { msgB } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Питание в норме
function supply(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(building?._id, obj, 'supply')
	// Питание в норме
	if (!sig && !acc.on) {
		delExtralrm(building._id, null, 'supply')
		acc.on = true
		acc._alarm = false
	}
	// Питания нет
	if (sig === true && !acc._alarm) {
		wrExtralrm(building._id, null, 'supply', { date: new Date(), ...msgB(building, 38) })
		acc.on = false
		acc._alarm = true
	}
	// return acc?._alarm ?? false
}

module.exports = supply
