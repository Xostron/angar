const { msg } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Работа от генератора - выкл секции
function genS(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(section?._id, obj, 'gen')
	// Сброс
	if (sig === true) {
		delExtralrm(building._id, section._id, 'gen')
		acc._alarm = false
	}
	// Установка
	if (sig === false && !acc._alarm) {
		wrExtralrm(building._id, section._id, 'gen', msg(building, section, 29))
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = genS
