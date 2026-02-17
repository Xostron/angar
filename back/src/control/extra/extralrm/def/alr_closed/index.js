const { getSignal, getSig } = require('@tool/command/signal')
const { reset, set, blink } = require('./fn')
const { data: store } = require('@store')

// Низкая температура канала секции
// 1. с учетом режима секции: если в авто - то выключится весь склад, не авто - склад продолжает работать
// 2. секция не в авто - не отправлять пуш
// 3. секция не в авто - count=false
function alrClosed(bld, sect, obj, s, se, m, automode, acc, data) {
	// Настройки
	const watch = s?.sys?.acWatch ?? s?.cooler?.acWatch ?? 10 * 60 * 1000
	const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 2) + 1
	// Режим секции
	const mode = obj.retain[bld._id].mode?.[sect._id]
	// Значение сигнала
	const sig = getSignal(sect?._id, obj, 'low')
	// Аккумулятор слежения за срабатыванием
	reset(bld, sect, acc, store.debounce)
	set(bld, sect, sig, store.debounce, acc, watch, count)
	blink(bld, sect, sig, acc, mode)
	// console.log(
	// 	5500,
	// 	sect.name,
	// 	`Режим = ${mode ? 'авто' : 'не авто'}`,
	// 	'Авария = ',
	// 	(acc._alarm ?? acc._self ?? null) && mode,
	// 	store.debounce?.alrClosed?.[sect._id],
	// 	acc,
	// 	store?.alarm?.extralrm?.[bld._id]?.[sect._id]?.alrClosed
	// )
	// acc._alarm - авария ручной сброс
	// acc._self - авария с автосбросом
	// mode = true - секция в авто, склад останавливается.
	// Секция в ручном или выкл - склад продолжает работать
	acc.result = (acc._alarm ?? acc._self ?? null) && mode
	return acc.result
}

module.exports = alrClosed

/**
 * Реле безопасности срабатывает от датчиков температуры (авария низ. температуры)
 * и дает сигнал "Низкая температура канала"
 *
 */
