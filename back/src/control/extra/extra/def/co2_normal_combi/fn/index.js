const { compareTime } = require('@tool/command/time')
const prepare = require('./prepare')

/*
Проветривание начинается с закрытых клапанов - это означает что на складе 
либо продукт достиг температуры задания или авария авторежима
(уличные условия не подходят)
При проветривании открываются клпана как в авторежиме и включаются ВНО
Поэтому acc.start = true - отключает блокировки авторежима и он начинает работать как будто в автомате
*/

// СО2: Вкл
function on(bld, obj, acc, m, se, s) {
	console.log(99001, 'on')
	acc.start = true
}

// СО2: Выкл
function off(bld, obj, acc, m, se, s) {
	console.log(99001, 'off')
	acc.start = false
}

// СО2: По времени
function time(bld, obj, acc, m, se, s) {
	const o = prepare(bld, obj, acc, m, se, s)
	console.log(99001, 'time', o)
	// Ожидание: Клапаны закрыты в течении времени wait
	if (o.vlvClose && !acc.work) {
		if (!acc.wait) acc.wait = new Date()
		// ожидаем
		const time = compareTime(acc.wait, s.co2.wait)
		// время не прошло
		if (!time) return
	}
	// Проветривание:
	// Включить удаление СО2
	if (o.tprd - 1.5 > o.point) acc.start = true
	// Выключить удаление СО2
	if (acc.start && o.tprd - 1 < o.point) acc.start = false

	// Время работы удаления СО2
	if (!acc.work) acc.work = new Date()
	// ожидаем
	const time = compareTime(acc.work, s.co2.work)
	// Время работы прошло
	if (time) acc = {}
}

// СО2: По датчику
function sensor(bld, obj, acc, m, se, s) {
	const o = prepare(bld, obj, acc, m, se, s)
	console.log(99001, 'sensor', o)
	if (o.co2 === null || o.co2 === undefined) return
	// Клапаны закрыты, co2 превышает уровень -> Проветриваем
	if (o.vlvClose && co2 - s.co2.hysteresis > s.co2.sp) {
		// Включить удаление СО2
		if (o.tprd - 1.5 > o.point) acc.start = true
		// Выключить удаление СО2
		if (acc.start && o.tprd - 1 < o.point) acc.start = false

		// Время работы удаления СО2
		if (!acc.work) acc.work = new Date()
		// ожидаем
		const time = compareTime(acc.work, s.co2.work)
		// Время работы прошло
		if (time) delete acc.work
		return
	}
	// Не надо проветривать
	acc = {}
}

module.exports = {
	on,
	time,
	sensor,
	off,
}
