const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgB } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Питание в норме
function supply(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(building?._id, obj, 'supply')
	const o = { bldId: building._id, code: 'supply' }
	// Питание в норме
	if (sig === false && !acc.on) {
		delExtralrm(building._id, null, 'supply')
		removeAcc(obj.acc, o, 'extralrm')
		acc.on = true
		acc.alarm = false
	}
	// Питания нет
	if (sig === true && !acc.alarm) {
		const mes = { date: new Date(), ...msgB(building, 38) }
		wrExtralrm(building._id, null, 'supply', mes)
		writeAcc(obj.acc, { ...o, mes }, 'extralrm')
		acc.on = false
		acc.alarm = true
	}
	// return acc?.alarm ?? false
}

module.exports = supply
