const { compareTime } = require('@tool/command/time')
const _MAX_SP = 100
const _MIN_SP = 20
const _BEGIN_SP = 70

/**
 * Пошаговое изменение задание ПЧ испарителя в
 * зависимости от тока двигателя ВНО испарителя
 * @param {*} sp
 * @param {*} clr
 * @param {*} fan
 * @param {*} s
 * @param {*} se
 * @param {*} acc
 * @returns {numbers} Задание ВНО испарителя
 */
function byCurrent(sp, clr, fan, s, se, acc) {
	// console.log(11, acc)
	// // Инициализация
	acc[clr._id] ??= {}
	acc[clr._id].current ??= {}
	acc[clr._id].current.sp ??= _BEGIN_SP
	acc[clr._id].current.date ??= null
	// У ВНО испарителя нет датчика тока - стандартное задание ПЧ
	if (!check(fan, se)) return sp

	// Датчик тока есть
	// Команда на повышение on/понижение off задания
	const { on, off } = onOff(fan, s, se)
	console.log(126, 'on = ', on, 'off = ', off)
	// Изменение уставки ПЧ испарителя acc[clr._id].current.sp
	regul(clr, fan, s, se, acc, on, off)

	return acc[clr._id].current.sp
}

module.exports = byCurrent

/**
 * Разрешение на регулирование по току
 * @param {*} fan
 * @param {*} se
 * @returns true - разрешено регулирование АО
 */
function check(fan, se) {
	if (isNaN(se?.[fan._id]?.value)) return false
	return true
}

/**
 * Сигнал на увеличение/уменьшение задания ПЧ испарителя
 * @param {*} fan
 * @param {*} s
 * @param {*} se
 * @returns
 */
function onOff(fan, s, se) {
	const on = se[fan._id].value < +fan?.actuator?.current - (s?.fan?.hystC ?? 1)
	const off = se[fan._id].value > +fan?.actuator?.current + (s?.fan?.hystC ?? 1)
	console.log(
		125,
		se[fan._id].value,
		'<',
		+fan?.actuator?.current - (s?.fan?.hystC ?? 1),

		'****',
		se[fan._id].value,
		'>',
		+fan?.actuator?.current + (s?.fan?.hystC ?? 1),
	)
	return { on, off }
}

/**
 * Изменение задания ПЧ испарителя
 * @param {*} clr
 * @param {*} fan
 * @param {*} s
 * @param {*} se
 * @param {*} acc
 * @param {*} on
 * @param {*} off
 * @returns
 */
function regul(clr, fan, s, se, acc, on, off) {
	acc[clr._id].current.date ??= new Date()
	// Время ожидания следующего шага
	const time = compareTime(acc[clr._id].current.date, s.fan.next)
	console.log(128, acc[clr._id].current.date, s.fan.next, time)
	// Время шага ПЧ не прошло -> выходим
	if (!time) return
	acc[clr._id].current.date = new Date()

	// Пошагово увеличиваем задание ПЧ
	if (on) {
		console.log(127, 'regul on')
		// Задание ПЧ дошло до 100% => выход
		if (acc[clr._id].current.sp >= _MAX_SP) {
			acc[clr._id].current.sp = _MAX_SP
			return
		}
		acc[clr._id].current.sp += s.fan.step
		// Ограничение max задания ПЧ
		acc[clr._id].current.sp =
			acc[clr._id].current.sp > _MAX_SP ? _MAX_SP : acc[clr._id].current.sp
	}

	// Пошагово уменьшаем задание ПЧ
	if (off) {
		console.log(127, 'regul off')
		// Задание ПЧ дошло до min%
		if (acc[clr._id].current.sp <= acc[clr._id].current.sp) {
			acc[clr._id].current.sp = _BEGIN_SP
			return
		}
		acc[clr._id].current.sp -= s.fan.step
		acc[clr._id].current.sp =
			acc[clr._id].current.sp < _BEGIN_SP ? _BEGIN_SP : acc[clr._id].current.sp
		// acc[clr._id].current.date = new Date()
	}
}
