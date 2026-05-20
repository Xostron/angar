const { data: store } = require('@store')
const { set, reset, blink } = require('./fn')
const { getSumSigBld, getSignalList } = require('@tool/command/signal')
/**
 * Генерация сообщения "Авария питания. Ручной сброс"
 * Подсчет сигналов склада, секции, батареи
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
function sb(bld, sect, obj, s, se, m, automode, acc, data) {
	// console.log(44, 'battery', acc)
	const watch = s?.sys?.rwatch ?? s?.cooler?.rwatch ?? 30 * 60 * 1000
	const count = (s?.sys?.rcount ?? s?.cooler?.rcount ?? 3) + 1
	// Склад: Сигнал "Питание в норме" false - питание в норме, true - питание отключено
	const sigB = getSumSigBld(bld?._id, obj, 'supply')
	// Секции: Массив значений сигналов "Питания в норме" со всех секций
	const sigS = getSignalList(bld?._id, obj, 'supply').map((el) => obj.value?.[el?._id] ?? null)

	const sig = [store.battery, sigB, ...sigS]

	/*
	// reason - кол-во взведенных сигналов, изменение данного числа будет
	// говорить о переключении питания
	const reason = sig.reduce((acc, el, i) => {
		if (el) acc++
		return acc
	}, 0)
	*/
	// reason -  есть хотя бы одна авария, флаг срабатываний авари питания
	const reason = sig.some(el=>!!el)
	reset(bld, acc, store.debounce)
	set(bld, reason, obj, store.debounce, acc, watch, count)

	// console.log(7700, acc, store.debounce.battery)
	return acc?._alarm ?? false
}

module.exports = sb
