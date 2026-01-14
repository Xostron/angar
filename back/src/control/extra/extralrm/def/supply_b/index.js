const { msgB } = require('@tool/message')
const { getSumSigBld } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')

// По складу: Питание в норме false - питание в норме, true - питание отключено
function supply(bld, sect, obj, s, se, m, automode, acc, data) {
	const sigB = getSumSigBld(bld._id, obj, 'supply')
	// Если взведена Авария питания (Ручной сброс) - игнорируем данную аварию
	if (isExtralrm(bld._id, null, 'battery')) {
		delExtralrm(bld._id, null, 'supply')
		acc._alarm = false
		return
	}
	// Питание в норме
	if (!sigB) {
		delExtralrm(bld._id, null, 'supply')
		acc._alarm = false
	}
	// Питание отключено
	if (sigB === true && !acc._alarm) {
		wrExtralrm(bld._id, null, 'supply', { date: new Date(), ...msgB(bld, 38) })
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = supply
