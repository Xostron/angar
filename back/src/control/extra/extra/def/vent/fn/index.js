const { setACmd } = require('@store')
const { stateEq } = require('@tool/command/fan')
const { stateV } = require('@tool/command/valve')

// Режим вентиляции: Вкл
function mOn(s, section) {
	// вентиляторы пуск
	setACmd('fan', section._id, { type: 'on', delay: s.sys.fan })
	
}

// Режим вентиляции: Авто - доп вентиляция (подхват)
function mAutoByDura(s, m, building, section, value, fanS, vlvS, alarm, acc, fanOff, resultFan) {
	const vlvIn = vlvS.find((vlv) => vlv.type === 'in')
	// Аккумулятор вычислений
	acc.byDura ??= {}
	// Отключение
	if (typeof s.vent.add!=='number' || typeof s.vent.max_add !=='number' || !vlvIn) {
		acc.byDura = {}
		return
	}
	// Состояние приточного клапана секции
	const state = stateV(vlvIn._id, value, building._id, vlvIn.sectionId[0])
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
	// console.log(222, 'Время отключения подхвата', new Date(acc?.byDura?.end), fanOff, alarm)
}

// Режим вентиляции: Авто - по времени
function mAutoByTime(s, m, building, section, value, fanS, vlvS, alarm, acc, fanOff, resultFan) {
	// Аккумулятор вычислений
	acc.byTime ??= {}

	// Отключение: нет настройки, аварии, бит завершения по времени, не был закончен подхват
	if (typeof s.vent.work !=='number' || (!alarm && !acc.byTime?.finish) || !acc?.byDura?.finish) {
		acc.byTime = {}
		return
	}
	// Текущее время
	const curTime = +new Date().getTime()
	// Инициализация функции
	if (!acc.byTime?.endWait) {
		acc.byTime.endWait = curTime + s.vent.wait
		acc.byTime.endWork = acc.byTime.endWait + s.vent.work
	}
	// Вкл вентиляции, когда истечет время ожидания
	if (curTime >= acc.byTime?.endWait) {
		// setACmd('fan', sectionId, { type: 'on', delay: s.sys.fan })
		resultFan.start = [true]
	}
	// Выкл вентиляцию, когда истечет время работы вентиляции
	if (curTime >= acc.byTime?.endWork) {
		// setACmd('fan', sectionId, { type: 'off', delay: s.sys.fan })
		resultFan.start = [false]
		acc.byTime.finish = true
	}
	// console.log(333, 'Время отключения по таймеру', new Date(acc?.byTime?.endWork), fanOff, alarm)
}

module.exports = { mAutoByTime, mAutoByDura, mOn }


