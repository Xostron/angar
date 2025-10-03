const { compareTime } = require('@tool/command/time')
const prepare = require('./prepare')
const { data: store, readAcc } = require('@store')

/*
Проветривание начинается с закрытых клапанов - это означает что на складе 
либо продукт достиг температуры задания или авария авторежима
(уличные условия не подходят)
При проветривании открываются клпана как в авторежиме и включаются ВНО
Поэтому acc.start = true - отключает блокировки авторежима и он начинает 
работать как будто в автомате
*/

// СО2: По времени
function time(bld, obj, acc, m, se, s) {
	const o = prepare(bld, obj, acc, m, se, s)
	console.log(99001, 'Удаление СО2 по времени', acc, s.co2.wait, s.co2.work)
	// Ожидание: Клапаны закрыты в течении времени wait
	if (!acc?.wait) {
		acc.wait = new Date()
		if (!o.vlvClose) return clear(acc, 'work', 'wait', 'start')
		// ожидаем
	}
	let time = compareTime(acc.wait, s.co2.wait.w)
	// время не прошло
	if (!time) return
	// Проветривание:
	// Включить удаление СО2
	if (o.tprd - 1.5 > o.point) acc.start = true
	// Выключить удаление СО2
	if (o.tprd - 1 < o.point) acc.start = false

	// Время работы удаления СО2
	if (!acc.work) acc.work = new Date()
	// ожидаем
	time = compareTime(acc.work, s.co2.work)
	// Время работы прошло
	if (time) clear(acc, 'work', 'wait', 'start')
}

// СО2: По датчику
function sensor(bld, obj, acc, m, se, s) {
	const o = prepare(bld, obj, acc, m, se, s)
	console.log(99001, 'Удаление СО2 по датчику', JSON.stringify(acc))
	if (o.co2 === null || o.co2 === undefined) return clear(acc, 'work', 'start')
	// Ожидание: Клапаны закрыты, co2 превышает уровень ->* Проветриваем
	if (!acc.work) {
		if (!o.vlvClose) return clear(acc, 'work', 'start')
		if (co2 < s.co2.sp) return
	}
	// ->* Проветриваем по времени s.co2.work
	// Включить удаление СО2
	if (o.tprd - 1.5 > o.point) acc.start = true
	// Выключить удаление СО2
	if (o.tprd - 1 < o.point) acc.start = false

	// Время работы удаления СО2
	if (!acc.work) acc.work = new Date()
	// ожидаем
	const time = compareTime(acc.work, s.co2.work)
	// Время работы прошло
	if (time) clear(acc, 'work', 'start')
}

/**
 * СО2: Вкл
 * @param {*} bld Склад
 * @param {*} obj Глобальные данные
 * @param {*} acc Аккумулятор
 * @param {*} m Устройства склада
 * @param {*} se Датчики склада
 * @param {*} s Настройки
 */
function on(bld, obj, acc, m, se, s) {
	console.log(99001, 'Удаление СО2 режим вкл', JSON.stringify(acc))
	const o = prepare(bld, obj, acc, m, se, s)
	// ->* Проветриваем по времени s.co2.work
	// Включить удаление СО2
	if (o.tprd - 1.5 > o.point) acc.start = true
	// Выключить удаление СО2
	if (o.tprd - 1 < o.point) acc.start = false
	acc.sol = fnSol(bld, obj, acc)
}

// СО2: Выкл
function off(bld, obj, acc, m, se, s) {
	console.log(99001, 'Удаление СО2 режим выкл', JSON.stringify(acc))
	acc.start = false
}

/**
 * Очистка аккумулятора
 * @param {*} acc
 * @param  {...any} args
 */
function clear(acc, ...args) {
	args.forEach((key) => (acc[key] = null))
}

/**
 * Для комбинированного склада в режиме холодильник
 * Условие вкл/выкл соленоидов испарителя
 * @param {object} bld
 * @param {object} acc
 * @param {object} obj
 * acc.sol = true - выкл соленоиды, false - оставить соленоиды как есть
 */
function fnSol(bld, obj, acc) {
	if (bld.type != 'combi' || !acc.start) return clear(acc, 'flagSol', 'sol')
	// Температура улицы
	const tout = obj.value.total[bld._id].tout.min
	// Температура задания канала
	const tgtTcnl = readAcc(bld._id, 'combi').cold.tgtTcnl
	if (tout < tgtTcnl && !acc.flagSol) return (acc.sol = true)
	if (tout >= tgtTcnl || acc.flagSol) {
		acc.flagSol = true
		return (acc.sol = false)
	}
}

module.exports = {
	on,
	time,
	sensor,
	off,
	fnSol,
}

// const { data: store, readAcc } = require('@store')
// // Удаление СО2: логика холодильника -> логика обычного
// const extraCO2 = readAcc(bld._id, 'building', 'co2')
// if (extraCO2.start) return true

// function time(bld, obj, acc, m, se, s) {
// 	const o = prepare(bld, obj, acc, m, se, s)
// 	console.log(99001, 'Удаление СО2 по времени', acc, s.co2.wait, s.co2.work)
// 	// Ожидание: Клапаны закрыты в течении времени wait
// 	if (!acc?.work) {
// 		if (!o.vlvClose && acc.start) return clear(acc, 'work', 'wait', 'start')
// 		if (!acc.wait) acc.wait = new Date()
// 		// ожидаем
// 		const time = compareTime(acc.wait, s.co2.wait.w)
// 		// время не прошло
// 		if (!time) return
// 	}
// 	// Проветривание:
// 	// Включить удаление СО2
// 	if (o.tprd - 1.5 > o.point) acc.start = true
// 	// Выключить удаление СО2
// 	if (o.tprd - 1 < o.point) acc.start = false

// 	// Время работы удаления СО2
// 	if (!acc.work) acc.work = new Date()
// 	// ожидаем
// 	const time = compareTime(acc.work, s.co2.work)
// 	// Время работы прошло
// 	if (time) clear(acc, 'work', 'wait', 'start')
// }
