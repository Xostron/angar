const { stateEq } = require('@tool/command/fan/fn')
const { stateV } = require('@tool/command/valve')
const { msg } = require('@tool/message')
const { delExtra, wrExtra, isExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Режим вентиляции: Вкл - принудительное включение
function mOn(s, sect, resultFan) {
	if (resultFan) resultFan.force = true
}

// Режим вентиляции: Авто - доп вентиляция (подхват)
function mAutoByDura(s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan) {
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	// Аккумулятор вычислений
	acc.byDura ??= {}
	// Отключение
	if (typeof s.vent.add !== 'number' || typeof s.vent.max_add !== 'number' || !vlvIn || acc?.byTime?.wait ) {
		acc.byDura = {}
		return
	}
	// Состояние приточного клапана секции
	const state = stateV(vlvIn._id, value, bld._id, vlvIn.sectionId[0])
	// Состояние напорных вентиляторов
	const run = fanS.some((f) => stateEq(f._id, value))

	// Текущее время
	const curTime = +new Date().getTime()

	// Во время подхвата исчезла авария - перезапуск вычислений
	if (!fanOff && acc.byDura?.end) {
		acc.byDura = {}
	}
	// acc.byDura.begin - точка начала работы вентиляторов
	if (run && !acc.byDura?.begin) {
		acc.byDura.begin = curTime
	}
	// Был ли во время работы вентиляторов открыт приточный клапан
	if (acc.byDura?.begin && !acc.byDura?.end && state != 'cls') {
		acc.byDura.vlvIn = true
	}
	// Вентиляторы собираются выключиться - расчет продолжительности подхвата
	if (fanOff && acc.byDura?.begin && !acc.byDura?.end) {
		// Дополнительное время вентиляции
		x = ((curTime - acc.byDura.begin) * s.vent.add) / 100
		// o.overtime = curTime - o.begin
		// Время отключения дополнительной вентиляции
		const overtime = x < s.vent.max_add ? x : s.vent.max_add
		acc.byDura.end = +(curTime + overtime).toFixed(0)
		wrExtra(bld._id, sect._id, 'vent_dura', msg(bld, sect, 86))
	}
	// Клапан не изменял своего состояния - завершить данный режим
	if (!acc.byDura?.vlvIn && acc.byDura?.end) {
		acc.byDura.finish = true
	}
	// Клапан изменял состояние: Подхват вентиляции
	if (acc.byDura?.vlvIn && acc.byDura?.end && curTime < acc.byDura?.end) {
		resultFan.start = [true]
	}
	// Выключение вентиляции
	if (curTime > acc.byDura?.end && !acc.byDura.finish) {
		resultFan.start = [false]
		acc.byDura.finish = true
	}
	if (acc.byDura.finish) delExtra(bld._id, sect._id, 'vent_dura')
	console.log(11141, 'vent Время отключения подхвата', acc, fanOff, alarm)
}

// Режим вентиляции: Авто - по времени
function mAutoByTime(s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan) {
	// Аккумулятор вычислений
	acc.byTime ??= {}
	// Отключение: нет настройки, аварии, бит завершения по времени, сейчас работает подхват
	if (
		typeof s.vent.work !== 'number' ||
		(Object.values(acc?.byDura ?? {}).length && !acc?.byDura.finish)
	) {
		acc.byTime = {}
		console.log(
			1117,
			'vent reset byTime',
			typeof s.vent.work !== 'number',
			Object.values(acc?.byDura).length
		)
		delExtra(bld._id, sect._id, 'vent_time_wait')
		delExtra(bld._id, sect._id, 'vent_time')
		return
	}

	// Ожидание
	acc.byTime.wait ??= new Date()
	let time = compareTime(acc.byTime.wait, s.vent.wait / 2)

	if (!time) {
		wrExtra(
			bld._id,
			sect._id,
			'vent_time_wait',
			msg(bld, sect, 87, `${s.vent.wait / 60 / 1000}мин)`)
		)
		return console.log(1118, 'vent: Ожидание', acc.byTime.wait, s.vent.wait)
	}
	// Вкл вентиляции, когда истечет время ожидания
	resultFan.start = [true]
	delExtra(bld._id, sect._id, 'vent_time_wait')
	wrExtra(bld._id, sect._id, 'vent_time', msg(bld, sect, 88))
	acc.byTime.work ??= new Date()
	time = compareTime(acc.byTime.work, s.vent.work)
	// Время работы прошло
	if (time) {
		delete acc.byTime?.work
		delete acc.byTime?.wait
		resultFan.start = [false]
		delExtra(bld._id, sect._id, 'vent_time')
	}
}

module.exports = { mAutoByTime, mAutoByDura, mOn }

// // Режим вентиляции: Авто - по времени
// function mAutoByTime(s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan) {
// 	// Аккумулятор вычислений
// 	acc.byTime ??= {}
// 	// Отключение: нет настройки, аварии, бит завершения по времени, сейчас работает подхват
// 	if (
// 		typeof s.vent.work !== 'number' ||
// 		(!alarm && !acc.byTime?.finish) ||
// 		Object.values(acc?.byDura).length
// 	) {
// 		acc.byTime = {}
// 		console.log(
// 			1115,
// 			'reset byTime',
// 			typeof s.vent.work !== 'number',
// 			!alarm && !acc.byTime?.finish,
// 			Object.values(acc?.byDura).length
// 		)
// 		delExtra(bld._id, sect._id, 'vent_time_wait')
// 		delExtra(bld._id, sect._id, 'vent_time')
// 		return
// 	}

// 	// Текущее время
// 	const curTime = +new Date().getTime()
// 	// Инициализация функции
// 	if (!acc.byTime?.endWait) {
// 		acc.byTime.endWait = curTime + s.vent.wait
// 		acc.byTime.endWork = acc.byTime.endWait + s.vent.work
// 		wrExtra(
// 			bld._id,
// 			sect._id,
// 			'vent_time_wait',
// 			msg(bld, sect, 87, `${s.vent.wait / 60 / 1000}мин)`)
// 		)
// 	}
// 	// Вкл вентиляции, когда истечет время ожидания
// 	if (curTime >= acc.byTime?.endWait) {
// 		resultFan.start = [true]
// 		delExtra(bld._id, sect._id, 'vent_time_wait')
// 		wrExtra(bld._id, sect._id, 'vent_time', msg(bld, sect, 88))
// 	}
// 	// Выкл вентиляцию, когда истечет время работы вентиляции
// 	if (curTime >= acc.byTime?.endWork) {
// 		resultFan.start = [false]
// 		acc.byTime.finish = true
// 	}
// 	// console.log(333, 'Время отключения по таймеру', new Date(acc?.byTime?.endWork), fanOff, alarm)
// 	if (acc.byTime.finish) {
// 		delExtra(bld._id, sect._id, 'vent_time_wait')
// 		delExtra(bld._id, sect._id, 'vent_time')
// 	}
// }
