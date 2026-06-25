const { msgB } = require('@tool/message')
const { getSumSigBld, getSigBld } = require('@tool/command/signal')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { data: store } = require('@store/index')
const { isReset } = require('@tool/reset')
const { compareTime } = require('@tool/command/time')

// Нет связи с сервером опроса модулей (только для микросервисов)
function plcio(bld, section, obj, s, se, m, automode, acc, data) {
	acc._alarm ??= {}
	// Если микросервисов нет, то сбрасываем данную аварию и выходим
	if (!m.services.length) {
		delExtralrm(bld._id, null, 'plcio')
		acc._alarm = {}
		return false
	}

	// Если время последнего подключения с сервером опроса модулей PLC_IO
	// не обновляется уже больше 30 сек, то неисправность связи
	m.services.forEach((srv) => {
		const sig = compareTime(store.timestampIO[srv._id], store._TIME_IO)
		if (sig === false) {
			acc._alarm[srv._id] = false
		}
		if (isReset(bld._id)) store.timestampIO[srv._id] = new Date()
		// Установка
		if (sig === true && !acc._alarm?.[srv._id]) {
			acc._alarm[srv._id] = true
		}
	})

	const alr = isAlarm(acc)
	if (alr) wrExtralrm(bld._id, null, 'plcio', msgB(bld, 43))
	else delExtralrm(bld._id, null, 'plcio')

	return alr
}

module.exports = plcio

function isAlarm(acc) {
	return Object.values(acc._alarm).some((el) => el) ?? false
}
