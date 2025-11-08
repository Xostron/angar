const { msgB } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Местное управление (сигнал склада)
function localB(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(building?._id, obj, 'local')
	// Сброс
	if (sig === true) {
		delExtralrm(building._id, null, 'local')
		acc._alarm = false
	}
	// Установка
	if (sig === false && !acc._alarm) {
		wrExtralrm(building._id, null, 'local', msgB(building, 27))
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = localB

/**
 * Переключение в местный режим, у каждой секции свой местный режим:
 * Все выключается (клапаны остаются в том состоянии, в котором были)
 * сервер не обрабатывает команды управления (web функционирует, в режиме просмотра)
 */
