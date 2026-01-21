const { getSumSigBld, getSignal } = require('@tool/command/signal')
const { getIdsS } = require('@tool/get/building')
const { reset, set, blink } = require('../alr_closed/fn')
const { data: store } = require('@store')

// Аварийное закрытие клапанов - по низкой температуре (склад)
function alrClosedB(bld, sect, obj, s, se, m, automode, acc, data) {
	// Настройки
	const watch = s?.sys?.acWatch ?? s?.cooler?.acWatch ?? 10 * 60 * 1000
	const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 2) + 1
	// Режим секции, хотя бы 1 секция в авто
	const idsS = getIdsS(obj?.data?.section, bld._id)
	const mode = idsS.some((el) => obj.retain[bld._id].mode?.[el._id])
	// const r = getSig(sect?._id, obj, 'low')
	// Значение сигнала
	const sig = getSignal(bld?._id, obj, 'low')
	// Аккумулятор слежения за срабатыванием
	reset(bld, sect, acc, store.debounce)
	set(bld, sect, sig, store.debounce, acc, watch, count)
	blink(bld, sect, sig, acc)

	return (acc._alarm ?? acc._self ?? null) && mode
}

module.exports = alrClosedB

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Аварийное закрытие клапанов"
 *
 */
