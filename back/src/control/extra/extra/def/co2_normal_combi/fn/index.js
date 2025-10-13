const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')
const { data: store, readAcc } = require('@store')
const { msgB } = require('@tool/message')
const { checkNow, clear } = require('./check')

// СО2: По времени
function time(bld, obj, acc, m, se, s, o, resultFan) {
	// Ожидание: Клапаны закрыты в течении времени wait
	acc.wait ??= new Date()
	let time = compareTime(acc.wait, s.co2.wait.w)
	// Ждем
	if (!time) {
		wrExtra(bld._id, null, 'co2', msgB(bld, 89, `${s.co2.wait.w / 60 / 1000}мин)`), 'co2_wait')
		return console.log(
			`\t3-Ожидание по таймеру ${s.co2.wait.w / 60 / 1000}мин)`,
			acc.wait,
			s.co2.wait.w
		)
	}
	// Ожидание прошло -> Время работы и проверка условий
	acc.work ??= new Date()
	// Условия не подходят -> встать на паузу по удалению СО2
	if (!checkNow(bld, obj, acc, o)) {
		acc.start = false
		// Время когда встали на паузу
		acc.pause ??= new Date()
		// Оставшееся время работы
		acc.remaining ??= s.co2.work - (acc.pause - acc.work)
		acc.work = new Date(acc.remaining + +new Date())
		resultFan.start.push(false)
		return console.log('\t3-Работа по таймеру (Пауза): условия не подходят')
	}
	// Условия подходят -> включить удаление СО2
	clear(acc, 'pause', 'remaining')
	acc.start = true
	resultFan.start.push(true)

	console.log('\t3-Работа по таймеру')
	delExtra(bld._id, null, 'co2', 'co2_wait')
	// Ждем время работы
	time = compareTime(acc.work, s.co2.work)
	// Время работы прошло
	if (time) clear(acc, 'work', 'wait', 'start')
}

// СО2: По датчику
function sensor(bld, obj, acc, m, se, s, o, resultFan) {
	// Условия не подходят
	if (!checkNow(bld, obj, acc, o)) {
		resultFan.start.push(false)
		return clear(acc, 'work', 'wait', 'start')
	}
	// CO2 не подходит
	if (o.co2 < s.co2.sp - s.co2.hysteresis) {
		console.log(
			'\t3-Запрещено удаление СО2 по датчику: низкий уровень СО2',
			o.co2,
			'<',
			s.co2.sp,
			'-',
			s.co2.hysteresis
		)
		resultFan.start.push(false)
		return clear(acc, 'wait', 'work', 'start')
	}
	console.log(
		'\t3-Разрешено удаление СО2 по датчику: высокий уровень СО2',
		o.co2,
		'>',
		s.co2.sp,
		'-',
		s.co2.hysteresis
	)
	acc.start = true
	acc.work = true
	resultFan.start.push(true)
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
function on(bld, obj, acc, m, se, s, o, resultFan) {
	if (checkNow(bld, obj, acc, o))
		(acc.start = true), (acc.work = true), resultFan.start.push(true)
	else clear(acc, 'work', 'wait', 'start'), resultFan.start.push(false)
	console.log('\tРежим: ВКЛ')
}

// СО2: Выкл
function off(bld, obj, acc, m, se, s, o, resultFan) {
	clear(acc, 'work', 'wait', 'start')
	delExtra(bld._id, null, 'co2', 'co2_wait')
	resultFan.start.push(false)
	console.log('\tРежим: ВЫКЛ')
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
