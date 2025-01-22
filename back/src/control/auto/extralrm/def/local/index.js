const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msg } = require('@tool/message')
const { writeAcc, removeAcc } = require('@tool/acc_json')

// Местное управление (сигнал секции)
function local(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(section?._id, obj, 'local')
	const o = { bldId: building._id, secId: section._id, code: 'local' }
	// Сброс
	if (sig===true || isReset(building._id)) {
		delExtralrm(building._id, section._id, 'local')
		removeAcc(obj.acc, o, 'extralrm')
		acc.alarm = false
	}
	// Установка
	if (sig===false && !acc.alarm) {
		const mes = { date: new Date(), ...msg(building, section,27) }
		wrExtralrm(building._id, section._id, 'local', mes)
		writeAcc(obj.acc, { ...o, mes }, 'extralrm')
		acc.alarm = true
	}
}

module.exports = local

/**
 * Переключение в местный режим, у каждой секции свой местный режим:
 * Все выключается (клапаны остаются в том состоянии, в котором были)
 * сервер не обрабатывает команды управления (web функционирует, в режиме просмотра)
 */

