const { data: store, delExtra, wrExtra } = require('@store')
const { msgB } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')

// Перегрев вводного кабеля (склад)
function cableB(building, section, obj, s, se, m, alarm, acc, data, ban) {
	const sig = getSignal(building?._id, obj, 'cable')
	if (!sig) {
		delExtra(building._id, null, 'cable')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		wrExtra(building._id, null, 'cable', {
			date: new Date(),
			...msgB(building, 60),
		})
		acc.alarm = true
	}
}
module.exports = cableB