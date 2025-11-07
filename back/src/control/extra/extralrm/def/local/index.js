const { msg } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Местное управление (сигнал секции)
function local(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(section?._id, obj, 'local')
	// Сброс
	if (sig === true) {
		delExtralrm(building._id, section._id, 'local')
		acc.alarm = false
	}
	// Установка
	if (sig === false && !acc.alarm) {
		wrExtralrm(building._id, section._id, 'local', msg(building, section, 27))
		acc.alarm = true
	}
}

module.exports = local

/**
 * Переключение в местный режим, у каждой секции свой местный режим:
 * Все выключается (клапаны остаются в том состоянии, в котором были)
 * сервер не обрабатывает команды управления (web функционирует, в режиме просмотра)
 */
