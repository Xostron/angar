const { compareTime } = require('@tool/command/time')
const _MAX_SP = 100
const _MIN_SP = 20
const _BEGIN_SP = 70

function byCurrent(sp, clr, fan, s, se, acc) {
	console.log(11, clr._id, fan._id, se[fan._id], isNaN(se[fan._id]), sp)
	// У ВНО испарителя нет датчика тока - стандартное задание ПЧ
	if (!check(fan, se)) return sp

	// Датчик тока есть
	// Команда на повышение/понижение задания
	const { on, off } = onOff(fan, s, se)

	// // Инициализация
	acc[clr._id].current ??= {}
	acc[clr._id].current.sp ??= _BEGIN_SP
	acc[clr._id].current.date ??= null
	// Изменение уставки ПЧ испарителя acc[clr._id].current.sp
	regul(clr, fan, s, se, acc, on, off)
	return acc[clr._id].current.sp
}

module.exports = byCurrent

function check(fan, se) {
	if (isNaN(se[fan._id])) return false
}

function onOff(fan, s, se) {
	const on = se[fan._id] < fan?.passport?.current - s?.fan?.hystC
	const off = se[fan._id] > fan?.passport?.current + s?.fan?.hystC
	return { on, off }
}

function regul(clr, fan, s, se, acc, on, off) {
	// Пошагово увеличиваем задание ПЧ
	if (on) {
		// Задание ПЧ дошло до 100% => выход
		if (acc[clr._id].current.sp >= _MAX_SP) {
			acc[clr._id].current.sp = _MAX_SP
			return
		}
		// Время ожидания следующего шага
		const time = compareTime(acc[clr._id].current.date, s.fan.next)
		// Время шага ПЧ не прошло -> выходим
		if (!time) return
		// Время шага прошло -> увеличиваем частоту
		// Время стабилизации прошло
		acc[clr._id].current.sp += s.fan.step
		// Ограничение max задания ПЧ
		acc[clr._id].current.sp =
			acc[clr._id].current.sp > _MAX_SP ? _MAX_SP : acc[clr._id].current.sp
		// acc[clr._id].current.date = new Date()
	}

	// Пошагово уменьшаем задание ПЧ
	if (off) {
		// Задание ПЧ дошло до min%
		if (acc[clr._id].current.sp <= acc[clr._id].current.sp) {
			acc[clr._id].current.sp = _BEGIN_SP
			return
		}
		// Ждем
		// Время ожидания следующего шага
		const time = compareTime(acc[clr._id].current.date, s.fan.next)
		// Время шага ПЧ не прошло -> выходим
		if (!time) return
		// Время стабилизации прошло
		acc[clr._id].current.sp -= s.fan.step
		acc[clr._id].current.sp =
			acc[clr._id].current.sp < _BEGIN_SP ? _BEGIN_SP : acc[clr._id].current.sp
		// acc[clr._id].current.date = new Date()
	}
	acc[clr._id].current.date = new Date()
}
