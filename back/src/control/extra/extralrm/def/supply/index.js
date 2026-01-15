const { msg } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')

// Питание в норме DI
function supply(bld, sect, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(sect?._id, obj, 'supply')
	// Если взведена Авария питания (Ручной сброс) - игнорируем данную аварию
	if (isExtralrm(bld._id, null, 'battery')) {
		delExtralrm(bld._id, sect._id, 'supply')
		acc._alarm = false
		return
	}
	// Питание в норме
	if (!sig) {
		delExtralrm(bld._id, sect._id, 'supply')
		acc._alarm = false
	}
	// Питание отключено
	if (sig === true && !acc._alarm) {
		wrExtralrm(bld._id, sect._id, 'supply', {
			date: new Date(),
			...msg(bld, sect, 38),
		})
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = supply
