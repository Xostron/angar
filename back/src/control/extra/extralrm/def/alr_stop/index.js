const { msgB } = require('@tool/message')
const { getSumSigBld } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Аварийный стоп
function alrStop(bld, section, obj, s, se, m, automode, acc, data) {
	const sig = getSumSigBld(bld._id, obj, 'alarm', false)

	// Сброс
	if (sig === true || sig === null) {
		delExtralrm(bld._id, null, 'alarm')
		acc._alarm = false
	}
	// Установка
	if (sig === false && !acc._alarm) {
		wrExtralrm(bld._id, null, 'alarm', msgB(bld, 36))
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = alrStop
