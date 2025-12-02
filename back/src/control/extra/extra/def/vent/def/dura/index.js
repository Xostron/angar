const { stateEq } = require('@tool/fan')
const { curStateV } = require('@tool/command/valve')
const { msg, msgB } = require('@tool/message')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { compareTime } = require('@tool/command/time')

// Режим вентиляции: Авто - Доп вентиляция выравнивания температуры
function fnDura(obj, s, m, bld, value, fan, alarm, acc, resultFan) {
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
		delExtra(bld._id, null, 'vent_dura')
		return
	}
	// Состояние приточного клапана секции
	const state = curStateV(vlvIn._id, value)
	// Состояние напорных вентиляторов
	const run = fan.some((f) => stateEq(f._id, value))

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
		wrExtra(bld._id, null, 'vent_dura', msgB(bld, 86))
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
	if (acc.byDura.finish) delExtra(bld._id, null, 'vent_dura')
	// console.log(11141, 'vent Время отключения подхвата', acc, fanOff, alarm)
}

module.exports = fnDura
