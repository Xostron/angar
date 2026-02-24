const { getSignal } = require('@tool/command/signal')
const { reset, set, blink, mm } = require('../alr_closed/fn')
const { data: store } = require('@store')

// Низкая температура канала склада
// Здесь учитывать режим секции не нужно, если авария возникла, то это окончательно
function alrClosedB(bld, sect, obj, s, se, m, automode, acc, data) {
	// Режим секции
	const modeA = Object.values(obj.retain[bld._id].mode).some(
		(el) => el === true || el === undefined,
	)
	const modeM = Object.values(obj.retain[bld._id].mode).some((el) => el === false)
	let mode
	if (modeA) mode = true
	else if (!modeA && modeM) mode = false
	else mode = null
	console.log(55001, mode)
	// Настройки: Время срабатывания аварии для авто = Х мин, для руч = 5сек
	const watch =
		mm[mode] == 'Авто' ? (s?.sys?.acWatch ?? s?.cooler?.acWatch ?? 10 * 60 * 1000) : 5 * 1000
	// const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 2) + 1
	// Режим секции, хотя бы 1 секция в авто
	// Значение сигнала
	const sig = getSignal(bld?._id, obj, 'low')

	// Аккумулятор слежения за срабатыванием
	reset(bld, null, acc, store.debounce, mode)
	set(bld, null, sig, store.debounce, acc, watch)
	blink(bld, null, acc)
	// console.log(
	// 	5500,
	// 	bld.name,
	// 	'Авария = ',
	// 	acc._alarm ?? acc._self ?? null,
	// 	store.debounce?.alrClosed?.[bld._id],
	// 	acc
	// )
	// acc.result = acc._alarm ?? acc._self ?? null
	return acc._alarm
}

module.exports = alrClosedB

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Низкая температура канала"
 *
 */
