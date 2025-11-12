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
	const watch = s?.sys?.rwatch ?? s?.cooler?.rwatch ?? 30 * 60 * 100
	const count = s?.sys?.rcount ?? s?.cooler?.rcount ?? 3
	console.log(44, 'battery', acc, store.debounce.battery, watch, count)

	reset(acc, store.debounce)
	set(bld, store.battery, obj, store.debounce, acc, watch, count)

	return acc?._alarm ?? false
}

module.exports = battery
