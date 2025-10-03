const { msg } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { data: store, readAcc } = require('@store')

// Температура канала ниже рекомендованной
function tChannel(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	// Аккумулятор авторежима
	const automode = obj.retain?.[bld._id]?.automode
	const t = bld?.type == 'normal' ? automode ?? bld?.type : bld?.type
	const accAuto = readAcc(bld._id, t)
	const map = accAuto?.cold?.softSol?.[sect._id]
	const warning = map?.get('warning')
	if (!warning) {
		delExtra(bld._id, sect._id, 't_channel')
		acc.alarm = false
	}
	// Установка
	if (warning && !acc.alarm) {
		wrExtra(bld._id, sect._id, 't_channel', {
			date: new Date(),
			...msg(bld, sect, 41),
		})
		acc.alarm = true
	}
}
module.exports = tChannel
