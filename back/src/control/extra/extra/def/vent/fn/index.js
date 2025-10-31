const { stateEq } = require('@tool/command/fan/fn')
const { curStateV } = require('@tool/command/valve')
const { msg } = require('@tool/message')
const { delExtra, wrExtra, isExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Режим вентиляции: Вкл - принудительное включение
function mOn(s, sect, resultFan) {
	if (resultFan) resultFan.force = true
}

// Режим вентиляции: Авто - доп вентиляция (подхват)
function mAutoByDura(obj, s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan) {
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	// Аккумулятор вычислений
	acc.byDura ??= {}
	// Отключение: нет настройки, нет приточных клапанов, сейчас в работе рециркуляция
	if (
		typeof s.vent.add !== 'number' ||
		typeof s.vent.max_add !== 'number' ||
		!vlvIn ||
		acc?.byTime?.start
	) {
		acc.byDura = {}
		delExtra(bld._id, sect._id, 'vent_dura')
		return
	}
	// Состояние приточного клапана секции
	const state = curStateV(vlvIn._id, value)
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
	// console.log(11141, fanOff)
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
	// console.log(11141, 'vent Время отключения подхвата', acc, fanOff, alarm)
}

// Режим вентиляции: Авто - по времени
function mAutoByTime(obj, s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan) {
	// Аккумулятор вычислений
	acc.byTime ??= {}
	// Отключение: нет настройки, аварии, бит завершения по времени, сейчас работает подхват
	if (
		typeof s.vent.work !== 'number' ||
		(Object.values(acc?.byDura ?? {}).length && !acc?.byDura.finish)
	) {
		acc.byTime = {}
		// console.log(
		// 	1117,
		// 	'vent reset byTime',
		// 	typeof s.vent.work !== 'number',
		// 	Object.values(acc?.byDura).length
		// )
		delExtra(bld._id, sect._id, 'vent_time_wait')
		delExtra(bld._id, sect._id, 'vent_time')
		return
	}

	// Ожидание
	acc.byTime.wait ??= new Date()
	let time = compareTime(acc.byTime.wait, s.vent.wait)
	// Время не прошло
	if (!time) {
		wrExtra(
			bld._id,
			sect._id,
			'vent_time_wait',
			msg(bld, sect, 87, `${s.vent.wait / 60 / 1000}мин)`)
		)
		// console.log(1118, 'vent: Ожидание', acc.byTime.wait, s.vent.wait)
		return
	}
	// Вкл вентиляции, когда истечет время ожидания
	resultFan.start = [true]
	acc.byTime.start = true
	delExtra(bld._id, sect._id, 'vent_time_wait')
	wrExtra(bld._id, sect._id, 'vent_time', msg(bld, sect, 88, `${s.vent.work / 60 / 1000}мин)`))
	acc.byTime.work ??= new Date()
	time = compareTime(acc.byTime.work, s.vent.work)
	// Время работы прошло
	if (time) {
		delete acc.byTime?.work
		delete acc.byTime?.wait
		// delete acc.byTime?.start
		resultFan.start = [false]
		delExtra(bld._id, sect._id, 'vent_time')
	}
}

module.exports = { mAutoByTime, mAutoByDura, mOn }
