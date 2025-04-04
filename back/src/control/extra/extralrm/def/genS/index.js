const { msg } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Работа от генератора - выкл секции
function genS(building, section, obj, s, se, m, automode, acc, data) {
	acc[section._id] ??= {}
	const sig = getSignal(section?._id, obj, 'gen')
	// Сброс
	if (sig === true || isReset(building._id)) {
		delExtralrm(building._id, section._id, 'gen')
		acc[section._id].alarm = false
	}
	// Установка
	if (sig === false && !acc[section._id].alarm) {
		wrExtralrm(building._id, section._id, 'gen', msg(building, section, 29))
		acc[section._id].alarm = true
	}
	return acc[section._id]?.alarm ?? false
}

module.exports = genS
