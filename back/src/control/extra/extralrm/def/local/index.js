const { msg } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Местное управление (сигнал секции)
function local(bld, sect, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(sect?._id, obj, 'local')
	// Сброс
	if (sig === true) {
		delExtralrm(bld._id, sect._id, 'local')
		acc._alarm = false
	}
	// Установка
	if (sig === false && !acc._alarm) {
		wrExtralrm(bld._id, sect._id, 'local', msg(bld, sect, 27))
		acc._alarm = true
	}
	// console.log(9900, 'Переключатель на щите секции', bld._id, sect._id, sig)
}

module.exports = local

/**
 * Переключение в местный режим, у каждой секции свой местный режим:
 * Все выключается (клапаны остаются в том состоянии, в котором были)
 * сервер не обрабатывает команды управления (web функционирует, в режиме просмотра)
 */
