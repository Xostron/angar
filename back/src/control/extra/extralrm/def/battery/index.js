const { data: store } = require('@store')
const { set, reset } = require('./fn')

/**
 * Авария питания. Дальнейшая работа невозможна
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
function battery(bld, sect, obj, s, se, m, automode, acc, data) {
	const watch = s?.sys?.rwatch ?? 30 * 60 * 100
	const count = s?.sys?.rcount ?? 3
	
	reset(acc)
	set(bld, store.battery, obj, store.debounce, acc, watch, count)

	console.log(77, store.battery, acc, store.debounce.battery, store.debounce?.battery?.length)
	return acc?._alarm ?? false
}

module.exports = battery
