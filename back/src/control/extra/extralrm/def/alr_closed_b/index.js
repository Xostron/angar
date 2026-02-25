const { getSignal } = require('@tool/command/signal')
const { reset, set, blink, check } = require('../alr_closed/fn')
const mm = require('@dict/def/mode_section')
const { data: store } = require('@store')
const { stateSum } = require('@tool/fan')

// Низкая температура канала склада
// Здесь учитывать режим секции не нужно, если авария возникла, то это окончательно
function alrClosedB(bld, sect, obj, s, se, m, automode, acc, data) {
	// Режим секции: хотя бы одна в авто
	const modeA = Object.values(obj.retain[bld._id].mode).some(
		(el) => el === true || el === undefined,
	)
	// Режим секции: хотя бы одна в ручном
	const modeM = Object.values(obj.retain[bld._id].mode).some((el) => el === false)
	let mode
	if (modeA) mode = true
	else if (!modeA && modeM) mode = false
	else mode = null

	// Настройки: Время срабатывания аварии для авто = Х мин, для руч = 5сек
	const watch =
		mm[mode] == 'Авто' ? (s?.sys?.acWatch ?? s?.cooler?.acWatch ?? 10 * 60 * 1000) : 5 * 1000
	// const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 2) + 1

	// Поиск работающих ВНО, в секциях-авто
	const isRunning = stateSum(bld._id, obj)
	// Значение сигнала склада
	const reason =
		mode === true
			? getSignal(bld?._id, obj, 'low') && !!isRunning.arr.length
			: getSignal(bld?._id, obj, 'low')
	// console.log(
	// 	7700,
	// 	isRunning,
	// 	'reason ANT = ',
	// 	reason,
	// 	'[',
	// 	getSignal(bld?._id, obj, 'low'),
	// 	!!isRunning.arr.length,
	// 	']',
	// )

	if (check(bld, sect, s, automode, mode, acc)) return
	reset(bld, null, acc, store.debounce, mode)
	set(bld, null, reason, store.debounce, acc, watch)
	blink(bld, null, acc)
	console.log(7704, 'Склад, Авария =', acc._alarm)
	return acc._alarm
}

module.exports = alrClosedB

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Низкая температура канала"
 *
 */
