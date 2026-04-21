const { getSignal, getSig } = require('@tool/command/signal')
const { reset, set, blink, check } = require('./fn')
const { data: store } = require('@store')
const mm = require('@dict/def/mode_section')
const { stateSum } = require('@tool/fan')

// Низкая температура канала секции
// 1. с учетом режима секции: если в авто - то выключится весь склад, не авто - склад продолжает работать
// 2. секция не в авто - не отправлять пуш
// 3. секция не в авто - count=false
function alrClosed(bld, sect, obj, s, se, m, automode, acc, data) {
	// Режим секции
	const mode = obj.retain[bld._id].mode?.[sect._id]
	// Настройки: Время срабатывания аварии для авто = Х мин, для руч = 3сек
	const watch =
		mm[mode] == 'Авто' ? (s?.sys?.acWatch ?? s?.cooler?.acWatch ?? 10 * 60 * 1000) : 3 * 1000

	// Поиск работающих ВНО, в секциях-авто
	const isRunning = stateSum(bld._id, obj, sect._id)

	// Причина:
	// для Авто: источник сигнала && работающие ВНО
	// для Руч: источник сигнала
	const reason =
		mm[mode] == 'Авто'
			? getSignal(sect?._id, obj, 'low') && !!isRunning.arr.length
			: getSignal(sect?._id, obj, 'low')

	// console.log(
	// 	5500,
	// 	sect.name,
	// 	isRunning,
	// 	'reason ANT = ',
	// 	reason,
	// 	'[',
	// 	getSignal(sect?._id, obj, 'low'),
	// 	!!isRunning.arr.length,
	// 	']',
	// )

	if (check(bld, sect, s, automode, mode, acc)) return
	reset(bld, sect, acc, store.debounce, mode)
	set(bld, sect, reason, store.debounce, acc, watch, mode)
	blink(bld, sect, acc)

	// console.log(5504, sect.name, 'Авария = ', acc)

	return acc._alarm
}

module.exports = alrClosed

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Низкая температура канала"
 *
 */
