const { getSignal, getSig } = require('@tool/command/signal')
const { reset, set, blink } = require('./fn')
const { data: store } = require('@store')

// Аварийное закрытие клапанов - по низкой температуре данной секции
// Останавливать склад - если секция в авто
function alrClosed(bld, sect, obj, s, se, m, automode, acc, data) {
	// Настройки
	const watch = s?.sys?.acWatch ?? s?.cooler?.acWatch ?? 10 * 60 * 1000
	const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 2) + 1
	// Режим секции
	const mode = obj.retain[bld._id].mode?.[sect._id]
	// const r = getSig(sect?._id, obj, 'low')
	// Значение сигнала
	const sig = getSignal(sect?._id, obj, 'low')
	// Аккумулятор слежения за срабатыванием
	reset(bld, sect, acc, store.debounce)
	set(bld, sect, sig, store.debounce, acc, watch, count)
	blink(bld, sect, sig, acc)

	return (acc._alarm ?? acc._self ?? null) && mode
}

module.exports = alrClosed

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */
