const { data: store } = require('@store')
const { set, reset, blink } = require('./fn')
const { getSumSigBld, getSignalList } = require('@tool/command/signal')
/**
 * Авария питания. Дальнейшая работа невозможна
 * Источник аварии:
 * 1. Питание от батареи
 * 2. Сигнал "Питание в норме"
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
	const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 3) + 1
	// Склад: Сигнал "Питание в норме" false - питание в норме, true - питание отключено
	const sigB = getSumSigBld(bld?._id, obj, 'supply')
	// Секции: Массив значений сигналов "Питания в норме" со всех секций
	const sigS = getSignalList(bld?._id, obj, 'supply').map((el) => obj.value?.[el?._id] ?? null)

	const sig = [store.battery, sigB, ...sigS]

	// Кол-во взведенных сигналов в reason, изменение данного числа будет
	// говорить о переключении питания
	const reason = sig.reduce((acc, el, i) => {
		if (el) acc++
		return acc
	}, 0)
	
	reset(acc, store.debounce)
	set(bld, reason, obj, store.debounce, acc, watch, count)
	blink(bld, store.battery, acc)
	
	console.log(5500, reason, sig, store.debounce.battery)
	return acc?._alarm ?? false
}

module.exports = battery
