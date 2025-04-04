const { msgB } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Работа от генератора - выкл склада
function genB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал "Работа от генератора"
	const sig = getSignal(building?._id, obj, 'gen')
	// Сброс
	if (sig === true || isReset(building._id)) {
		delExtralrm(building._id, null, 'gen')
		acc.alarm = false
	}
	// Установка
	if (sig === false && !acc.alarm) {
		wrExtralrm(building._id, null, 'gen', msgB(building, 29))
		acc.alarm = true
	}
	return acc.alarm ?? null
}

module.exports = genB
