const { delExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')
const fn = require('./fn')
/**
 * Антидребезг исполнительных механизмов:
 * ВНО (fan, accel, cooler), клапаны (in,out), подогрев клапанов (heating),
 * оттайка испарителя(cooler), обогрев слива воды(water)
 * @param {*} bld
 * @param {*} sect
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} m
 * @param {*} automode
 * @param {*} acc
 * @param {*} data
 * @returns
 */
function debdo(bld, sect, obj, s, se, m, automode, acc, data) {
	const watch = (s?.sys?.debDO ?? s?.cooler?.debDO ?? 20) * 1000
	const count = s?.sys?.debCount ?? s?.cooler?.debCount ?? 4
	const wait = s?.sys?.debWait ?? s?.cooler?.debWait ?? 30 * 60 * 1000 // 30 мин

	console.log(66, 'debdo', acc)
	// напорные ВНО канала + разгонные + ВНО испарителей
	fn(bld, m.fanAll, obj, store.debounce, acc, watch, count)
	// Время автосброса аварии
	if (acc._alarm && !acc.wait) acc.wait = new Date()
	const waitCom = compareTime(acc.wait, wait)
	// Сброс аварии:
	// 1. Системные настройки (кол-во переключений, время подсчета) равны нулю,
	// 2. Время автосброса истекло,
	if (!watch || !count || !wait || waitCom) {
		// Сброс аварийных сообщений
		delExtralrm(bld._id, null, 'debdo')
		acc._alarm = false
		delete acc.wait
	}
	// console.log(66,  'wait=', wait)
	return acc?._alarm ?? false
}

module.exports = debdo
