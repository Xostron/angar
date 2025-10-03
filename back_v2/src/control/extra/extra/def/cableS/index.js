const { msg } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const {delExtra, wrExtra} = require('@tool/message/extra')

// Перегрев вводного кабеля (секция)
function cableS(building, section, obj, s, se, m, alarm, acc, data, ban) {
	const sig = getSignal(section?._id, obj, 'cable')
	if (!sig) {
		delExtra(building._id, section._id, 'cable')
		acc.alarm = false
	}
	// Установка
	if (sig && !acc.alarm) {
		wrExtra(building._id, section._id, 'cable', msg(building, section, 60))
		acc.alarm = true
	}
}
module.exports = cableS
