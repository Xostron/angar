const { msg } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { data: store, readAcc } = require('@store')
const { isAllStarted } = require('@store/index')

// TODO 42 - ступенчатое управление (вернуть обратно по требованию)
// Температура канала ниже рекомендованной (комби-холодильник)
// function tChannel(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
// 	// Аккумулятор авторежима
// 	const automode = obj.retain?.[bld._id]?.automode
// 	const t = bld?.type == 'normal' ? automode ?? bld?.type : bld?.type
// 	const accAuto = readAcc(bld._id, t)
// 	const map = accAuto?.cold?.softSol?.[sect._id]
// 	const warning = map?.get('warning')
// 	if (!warning) {
// 		delExtra(bld._id, sect._id, 't_channel')
// 		acc.flag = false
// 	}
// 	// Установка
// 	if (warning && !acc.flag) {
// 		wrExtra(bld._id, sect._id, 't_channel', {
// 			date: new Date(),
// 			...msg(bld, sect, 41),
// 		})
// 		acc.flag = true
// 	}
// }

// Температура канала ниже рекомендованной
function tChannel(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	// Комби-холодильник: Флаг для отключения испарителей, true - все вспомагательные механизмы подогрева канала запущены
	if (!isAllStarted(sect._id)) {
		delExtra(bld._id, sect._id, 't_channel')
		acc.flag = false
	}
	// Установка
	if (isAllStarted(sect._id) && !acc.flag) {
		wrExtra(bld._id, sect._id, 't_channel', {
			date: new Date(),
			...msg(bld, sect, 41),
		})
		acc.flag = true
	}
}

module.exports = tChannel
