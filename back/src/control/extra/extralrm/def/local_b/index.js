const { msgB } = require('@tool/message')
const { getSumSig } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Местное управление (сигнал склада)
function localB(bld, section, obj, s, se, m, automode, acc, data) {
	// const sig = getSignal(bld?._id, obj, 'local')
	const sig = getSumSig(bld._id, obj?.data?.section, obj, 'local')
	// Сброс
	if (sig === true) {
		delExtralrm(bld._id, null, 'local')
		acc._alarm = false
	}
	// Установка
	if (sig === false && !acc._alarm) {
		wrExtralrm(bld._id, null, 'local', msgB(bld, 27))
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
