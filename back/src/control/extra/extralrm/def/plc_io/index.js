const { msgB } = require('@tool/message')
const { getSumSigBld, getSigBld } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { data: store } = require('@store/index')
const { isReset } = require('@tool/reset')
const { compareTime } = require('@tool/command/time')

// Нет связи с сервером опроса модулей (только для микросервисов)
function plcio(bld, section, obj, s, se, m, automode, acc, data) {
	// Если время последнего подключения с сервером опроса модулей PLC_IO
	// не обновляется уже больше 30 сек, то неисправность связи
	const sig = process.env.MODE === 'micro' && compareTime(store.timestampIO, store._TIME_IO)

	if (sig === false) {
		delExtralrm(bld._id, null, 'plcio')
		acc._alarm = false
	}
	if (isReset(bld._id)) store.timestampIO = new Date()
	// Установка
	if (sig === true && !acc._alarm) {
		wrExtralrm(bld._id, null, 'plcio', msgB(bld, 43))
		acc._alarm = true
	}
	return acc?._alarm ?? false
}

module.exports = plcio
