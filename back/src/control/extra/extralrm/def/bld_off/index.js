const { msgB } = require('@tool/message')
const { getSumSigBld } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')

// Кнопка выкючения склада (все выкл и закрываются клапаны)
function bldOff(bld, section, obj, s, se, m, automode, acc, data) {
	const sig = getSumSigBld(bld._id, obj, 'bldOff', false)

	// Сброс
	if (sig === false || sig === null) {
		delExtralrm(bld._id, null, 'bldOff')
		acc._alarm = false
	}
	// Установка
	if (sig === true && !acc._alarm) {
		wrExtralrm(bld._id, null, 'bldOff', msgB(bld, 37))
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = bldOff
