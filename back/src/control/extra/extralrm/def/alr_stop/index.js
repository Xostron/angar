const { msgB } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Аварийный стоп
function alrStop(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(building?._id, obj, 'alarm')
	// Сброс
	if (sig === true) {
		delExtralrm(building._id, null, 'alarm')
		acc._alarm = false
	}
	// Установка
	if (sig === false && !acc._alarm) {
		wrExtralrm(building._id, null, 'alarm', msgB(building, 36))
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = alrStop
