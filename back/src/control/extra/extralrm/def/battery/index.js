const { data: store } = require('@store')
const { msgBB } = require('@tool/message')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')

/**
 * Авария питания. Дальнейшая работа невозможна
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
	const watch = s?.sys?.rwatch ?? 30 * 60 * 100
	const count = s?.sys?.rcount ?? 3

	fn(bld, store.battery, obj, store.debounce, acc, watch, count)

	if (acc._alarm) acc.flag = true

	// console.log(77, store.battery, acc, store.debounce.battery, store.debounce?.battery?.length)
	return acc?._alarm ?? false
}

module.exports = battery

/**
 * Функция слежения и генерации аварии дребезга
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function fn(bld, battery, obj, accDeb, acc, watch, count) {
	if (!count || !watch) return
	accDeb.battery ??= []
	const last = accDeb.battery.at(-1)
	const isAlr = isExtralrm(bld._id, null, 'battery')
	// При сбросе аварии: очистка аккумулятора
	if (acc.flag && !acc._alarm) {
		store.debounce.battery = []
		acc.flag = false
	}
	// Уже в аварии - выходим из итерации
	if (isAlr) return

	// Фиксируем изменение состояния
	if (last?.state !== battery) accDeb.battery.push({ state: battery, date: new Date() })
	// Размер очереди превышен
	if (accDeb.battery.length > count) accDeb.battery.shift()

	// Проверка на дребезг, после count переключений
	if (accDeb.battery.length < count) return

	const delta = accDeb.battery.at(-1).date - accDeb.battery[0].date
	// Время между последними состояниями больше порога дребезга -> ОК
	if (delta > watch) return
	//Время меньше порога -> установка аварии
	wrExtralrm(bld._id, null, 'battery', msgBB(bld, 103))
	acc._alarm = true
}
