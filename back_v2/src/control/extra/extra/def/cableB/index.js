const { msgB } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const {delExtra, wrExtra} = require('@tool/message/extra')

// Перегрев вводного кабеля (склад)
function cableB(building, section, obj, s, se, m, alarm, acc, data, ban) {
	const sig = getSignal(building?._id, obj, 'cable')
	if (!sig) {
		delExtra(building._id, null, 'cable')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		wrExtra(building._id, null, 'cable', msgB(building, 60))
		acc.alarm = true
	}
}
module.exports = cableB
