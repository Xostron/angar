const { msg } = require('@tool/message')
const { getSignal, getSig } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Работа от генератора - выкл секции
function genS(building, section, obj, s, se, m, automode, acc, data) {
	const sig = getSignal(section?._id, obj, 'gen')
	const moduleId = getSig(section?._id, obj, 'gen')?.module?.id
	// Сброс
	if (sig === true) {
		delExtralrm(building._id, section._id, 'gen')
		acc._alarm = false
	}
	// Установка
	if (sig === false && !acc._alarm) {
		wrExtralrm(building._id, section._id, 'gen', msg(building, section, 29), [moduleId])
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = genS
