const { msgB } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Работа от генератора - выкл склада
function genB(building, section, obj, s, se, m, automode, acc, data) {
	// Сигнал "Работа от генератора"
	const sig = getSignal(building?._id, obj, 'gen')
	// Сброс
	if (sig === true) {
		delExtralrm(building._id, null, 'gen')
		acc._alarm = false
	}
	// Установка
	if (sig === false && !acc._alarm) {
		wrExtralrm(building._id, null, 'gen', msgB(building, 29))
		acc._alarm = true
	}
	return acc._alarm ?? null
}

module.exports = genB
