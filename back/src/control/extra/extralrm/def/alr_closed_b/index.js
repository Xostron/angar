const { getSumSigBld, getSignal } = require('@tool/command/signal')
const { getIdsS } = require('@tool/get/building')
const { reset, set, blink } = require('../alr_closed/fn')
const { data: store } = require('@store')

// Низкая температура канала склада
// Здесь учитывать режим секции не нужно, если авария возникла, то это окончательно
function alrClosedB(bld, sect, obj, s, se, m, automode, acc, data) {
	// Настройки
	const watch = s?.sys?.acWatch ?? s?.cooler?.acWatch ?? 10 * 60 * 1000
	const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 2) + 1
	// // Режим секции, хотя бы 1 секция в авто
	// const idsS = getIdsS(obj?.data?.section, bld._id)
	// const mode = idsS.some((el) => obj.retain[bld._id].mode?.[el._id])

	// Значение сигнала
	const sig = getSignal(bld?._id, obj, 'low')
	// Аккумулятор слежения за срабатыванием
	reset(bld, null, acc, store.debounce)
	set(bld, null, sig, store.debounce, acc, watch, count)
	blink(bld, null, sig, acc)
	// console.log(
	// 	5500,
	// 	bld.name,
	// 	'Авария = ',
	// 	acc._alarm ?? acc._self ?? null,
	// 	store.debounce?.alrClosed?.[bld._id],
	// 	acc
	// )
	acc.result = acc._alarm ?? acc._self ?? null
	return acc.result
}

module.exports = alrClosedB

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Низкая температура канала"
 *
 */
