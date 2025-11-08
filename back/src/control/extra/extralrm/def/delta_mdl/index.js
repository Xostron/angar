const { msgB } = require('@tool/message')
const { getSignal } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// ПЛК delta, сигналы неисправности модулей
function deltaMdl(building, section, obj, s, se, m, automode, acc, data) {
	const val = getSignal(building?._id, obj, 'deltaMdl')
	const comment = obj.data.signal.find((el) => el.type === 'deltaMdl')?.comment
	// Сброс
	if (val === false) {
		delExtralrm(building._id, null, 'deltaMdl')
		acc._alarm = false
	}
	// Установка
	if (val === true && !acc._alarm) {
		wrExtralrm(building._id, null, 'deltaMdl', msgB(building, 111, comment))
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = deltaMdl
