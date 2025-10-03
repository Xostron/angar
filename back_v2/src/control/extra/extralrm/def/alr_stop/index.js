const { msgB } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Аварийный стоп
function alrStop(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(building?._id, obj, 'alarm')
	// Сброс
	if (sig === true || isReset(building._id)) {
		delExtralrm(building._id, null, 'alarm')
		acc.alarm = false
	}
	// Установка
	if (sig === false && !acc.alarm) {
		wrExtralrm(building._id, null, 'alarm', msgB(building, 36))
		acc.alarm = true
	}
	return acc?.alarm ?? false
}

module.exports = alrStop
