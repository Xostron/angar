const { msgB } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Местное управление (сигнал склада)
function localB(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(building?._id, obj, 'local')
	// Сброс
	if (sig === true || isReset(building._id)) {
		delExtralrm(building._id, null, 'local')
		acc.alarm = false
	}
	// Установка
	if (sig === false && !acc.alarm) {
		wrExtralrm(building._id, null, 'local', msgB(building, 27))
		acc.alarm = true
	}
	return acc?.alarm ?? false
}

module.exports = localB

/**
 * Переключение в местный режим, у каждой секции свой местный режим:
 * Все выключается (клапаны остаются в том состоянии, в котором были)
 * сервер не обрабатывает команды управления (web функционирует, в режиме просмотра)
 */
