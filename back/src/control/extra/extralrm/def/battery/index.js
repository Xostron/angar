const { data: store } = require('@store')
const { set, reset, blink } = require('./fn')

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
	// console.log(44, 'battery', acc)
	const watch = s?.sys?.rwatch ?? s?.cooler?.rwatch ?? 30 * 60 * 100
	const count = s?.sys?.rcount ?? s?.cooler?.rcount ?? 3

	reset(acc, store.debounce)
	set(bld, store.battery, obj, store.debounce, acc, watch, count)
	blink(bld, store.battery)
	return acc?._alarm ?? false
}

module.exports = battery
