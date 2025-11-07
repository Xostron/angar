const { data: store } = require('@store')
const { msgBB } = require('@tool/message')
const { delExtralrm, wrExtralrm, isExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')

/**
 * Антидребезг исполнительных механизмов:
 * ВНО (fan, accel), клапаны (in,out), подогрев клапанов (heating),
 * оттайка испарителя(cooler), обогрев слива воды(water)
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
function relayVolt(bld, sect, obj, s, se, m, automode, acc, data) {
	const defaultWait = 30 * 60 * 1000 //30 мин
	const watch = s?.sys?.rwatch ?? defaultWait
	const count = s?.sys?.rcount ?? 3

	fn(bld, store.battery, obj, store.debounce, acc, watch, count)

	const wait = s?.sys?.rwait === 0 ? false : compareTime(s?.sys?.rwait ?? defaultWait)
	// Сброс аварии: настройки1 и 2 равны 0, время ожидания истекло
	if ( !watch || !count || wait) {
		// Сброс аварийных сообщений
		delExtralrm(bld._id, null, 'battery')
		acc.alarm = false
	}
	return acc?.alarm ?? false
}

module.exports = relayVolt

/**
 * Функция слежения и генерации аварии дребезга
 * @param {object[]} arr Массив исполнительных механизмов
 * @param {object} value Глобальные состояния
 * @param {object} s Настройки
 * @param {object} accDeb Аккумулятор антидребезга
 */
function fn(bld, battery, obj, accDeb, acc, watch, count) {
	accDeb.battery ??= []
	const last = accDeb.battery.at(-1)
	const isAlr = isExtralrm(bld._id, null, 'battery')
	// console.log(22, '@@@@@@@@@@@@@@@@@@@@@@@@@@@@', accDeb.battery, isAlr)
	if (isAlr) {
		acc.alarm = true
		return
	}
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
	acc.alarm = true
}
