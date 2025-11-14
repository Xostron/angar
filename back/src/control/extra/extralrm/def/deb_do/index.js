const { data: store } = require('@store')
const { set, reset, fnCheck } = require('./fn')
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
	const { heatingAll, heatingWAll, heatingClrAll, fanAll } = m
	const watch = (s?.sys?.debDO ?? s?.cooler?.debDO ?? 10) * 1000
	let count = s?.sys?.debCount ?? s?.cooler?.debCount ?? 3
	count += 1
	const wait = s?.sys?.debWait ?? s?.cooler?.debWait ?? 30 * 60 * 1000 // 30 мин
	const arr = [...fanAll]
	console.log(
		66,
		count,
		'debdo',
		acc,
		// store.debounce
		// 'heatingAll',
		// heatingAll,
		// 'heatingWAll',
		// heatingWAll,
		// 'heatingClrAll',
		// heatingClrAll
	)
	// Разрешение на работу
	if (!fnCheck(bld, watch, count, wait, arr, acc, store.debounce)) return false

	// Автосброс аварии
	reset(bld, wait, arr, acc, store.debounce)
	// 1. напорные ВНО канала + разгонные + ВНО испарителей
	set(bld, fanAll, obj, store.debounce, acc, watch, count)
	// 2. Клапаны
	// 3. Обогрев клапанов
	// 4. Оттайка слива воды
	// 3. Оттайка испарителя

	return acc?._alarm ?? false
}

module.exports = debdo
