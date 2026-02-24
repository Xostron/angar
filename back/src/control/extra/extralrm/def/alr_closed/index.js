const { getSignal, getSig } = require('@tool/command/signal')
const { reset, set, blink, mm } = require('./fn')
const { data: store } = require('@store')

// Низкая температура канала секции
// 1. с учетом режима секции: если в авто - то выключится весь склад, не авто - склад продолжает работать
// 2. секция не в авто - не отправлять пуш
// 3. секция не в авто - count=false
function alrClosed(bld, sect, obj, s, se, m, automode, acc, data) {
	// Режим секции
	const mode = obj.retain[bld._id].mode?.[sect._id]
	// Настройки: Время срабатывания аварии для авто = Х мин, для руч = 5сек
	const watch =
		mm[mode] == 'Авто' ? (s?.sys?.acWatch ?? s?.cooler?.acWatch ?? 10 * 60 * 1000) : 5 * 1000
	// const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 2) + 1
	// Значение сигнала
	const sig = getSignal(sect?._id, obj, 'low') && mode!==null

	// Аккумулятор слежения за срабатыванием
	reset(bld, sect, acc, store.debounce, mode)
	set(bld, sect, sig, store.debounce, acc, watch)
	blink(bld, sect, acc)

	console.log(
		5500,
		sect.name,
		`Режим = ${mm[mode]}`,
		'Авария = ',
		(acc._alarm ?? acc._self ?? null) && mode,
		store.debounce?.alrClosed?.[sect._id],
	)

	return acc._alarm
}

module.exports = alrClosed



/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Низкая температура канала"
 *
 */
