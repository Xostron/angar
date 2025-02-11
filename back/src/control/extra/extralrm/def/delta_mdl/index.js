const { getSignal } = require('@tool/command/signal')
const { data: store, wrExtralrm, delExtralrm, isReset } = require('@store')
const { msgB } = require('@tool/message')

// ПЛК delta, сигналы неисправности модулей
function deltaMdl(building, section, obj, s, se, m, automode, acc, data) {
	const val = getSignal(building?._id, obj, 'deltaMdl')
	const comment = obj.data.signal.find((el) => el.type === 'deltaMdl')?.comment
	// Сброс
	if (val === false || isReset(building._id)) {
		delExtralrm(building._id, null, 'deltaMdl')
		acc.alarm = false
	}
	// Установка
	if (val === true && !acc.alarm) {
		wrExtralrm(building._id, null, 'deltaMdl', msgB(building, 111, comment))
		acc.alarm = true
	}
	return acc?.alarm ?? false
}

module.exports = deltaMdl
