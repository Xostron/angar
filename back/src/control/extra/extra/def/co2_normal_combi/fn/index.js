const { compareTime } = require('@tool/command/time')
const prepare = require('./prepare')
const { data: store, readAcc } = require('@store')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
/*
Проветривание начинается с закрытых клапанов - это означает что на складе 
либо продукт достиг температуры задания или авария авторежима
(уличные условия не подходят)
При проветривании открываются клпана как в авторежиме и включаются ВНО
Поэтому acc.start = true - отключает блокировки авторежима и он начинает 
работать как будто в автомате
*/

// СО2: По времени
function time(bld, obj, acc, m, se, s, o) {
	// Ожидание: Клапаны закрыты в течении времени wait
	acc.wait ??= new Date()

	if (!o.vlvClose && !acc.work && !acc.start) {
		console.log(99001, 'Удаление СО2 по времени: заблокировано (открыт клапан)')
		return clear(acc, 'work', 'wait', 'start')
	}
	let time = compareTime(acc.wait, s.co2.wait.w)
	// время не прошло
	if (!time) {
		wrExtra(
			bld._id,
			null,
			'co2',
			msgB(bld, 89, `${s.co2.wait.w / 60 / 1000}мин)`),
			'co2_wait'
		)
		return console.log(99001, 'Удаление СО2 по времени: Ожидание', acc.wait, s.co2.wait.w)
	}
	// точка росы не подходит
	if (o.tprd - 1 < o.point) {
		acc.start = false
		// Время когда встали на паузу из-за точки росы
		acc.pause ??= new Date()
		// Оставшееся время работы удаления СО2
		acc.work ??= new Date()
		acc.remaining ??= s.co2.work - (acc.pause - acc.work)
		acc.work = acc.remaining + +new Date()
		acc.work = new Date(acc.work)
		return console.log(99001, 'Удаление СО2 по времени: точка росы не подходит')
	}
	clear(acc, 'pause', 'remaining')
	// Проветривание:
	// Включить удаление СО2
	if (o.tprd - 1.5 > o.point) acc.start = true
	// Выключить удаление СО2
	// if (o.tprd - 1 < o.point) acc.start = false
	console.log(99001, 'Удаление СО2 по времени: Работа', acc)
	delExtra(bld._id, null, 'co2', 'co2_wait')
	// Время работы удаления СО2
	acc.work ??= new Date()
	// ожидаем
	time = compareTime(acc.work, s.co2.work)
	// Время работы прошло
	if (time) clear(acc, 'work', 'wait', 'start')
}

// СО2: По датчику
function sensor(bld, obj, acc, m, se, s, o) {
	if (o.co2 === null || o.co2 === undefined) {
		console.log(99001, 'Удаление СО2 по датчику: показание CO2 = null | undefined')
		return clear(acc, 'work', 'start')
	}
	if (!o.vlvClose && !acc.start) {
		console.log(99001, 'Удаление СО2 по датчику: клапаны открыты')
		return clear(acc, 'work', 'start')
	}
	if (o.co2 < s.co2.sp - s.co2.hysteresis) {
		console.log(
			99001,
			'Удаление СО2 по датчику: датчик СО2 не достиг критического уровня СО2',
			o.co2,
			s.co2.sp,
			s.co2.hysteresis
		)
		return clear(acc, 'work', 'start')
	}
	// Включить удаление СО2
	if (o.tprd - 1.5 > o.point) {
		console.log(99001, 'Удаление СО2 по датчику: работа')
		acc.start = true
	}
	// Выключить удаление СО2
	if (o.tprd - 1 < o.point) {
		console.log(99001, 'Удаление СО2 по датчику: точка росы не подходит')
		acc.start = false
	}
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
function on(bld, obj, acc, m, se, s, o) {
	console.log(99001, 'Удаление СО2 режим вкл', JSON.stringify(acc))
	// Включить удаление СО2
	if (o.tprd - 1.5 > o.point) acc.start = true
	// Выключить удаление СО2
	if (o.tprd - 1 < o.point) acc.start = false
}

// СО2: Выкл
function off(bld, obj, acc, m, se, s, o) {
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
	clear,
}