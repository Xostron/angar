const { compareTime } = require('@tool/command/time')
const { setACmd } = require('@tool/command/set')

function calc(prepare) {
	const { acc, cmd, isCN, isN, alrAuto, notDur, achieve, idsS, s } = prepare
	acc.byDur ??= {}
	acc.byDur.queue ??= []
	console.log('s.ventTime.time', s.ventTime, 's.fan.delay', s.fan.delay)
	// 1. Фиксация работы ВНО
	if (!acc.byDur.queue[0] && cmd.start && !cmd.force) {
		acc.byDur.queue[0] = { start: true, date: new Date() }
		acc.byDur.queue[1] = null
		return
	}
	// 2. Фиксация останова ВНО по достижению задания или аварий авторежима
	if (acc.byDur.queue[0] && !cmd.start && !cmd.force && !notDur && (alrAuto || achieve)) {
		acc.byDur.queue[1] = { start: false, date: new Date() }
	}
	// 3. Проверка очереди: наличие 1 и 2 фиксации
	if (!acc.byDur.queue?.[0]?.date || !acc.byDur.queue?.[1]?.date) return
	// Защита от отрицательного времени, сбрасываем очередь
	const deltaTime = acc.byDur.queue[1].date - acc.byDur.queue[0].date
	if (deltaTime < 0) {
		acc.byDur.queue = []
		return
	}

	// 4. Расчет времени доп. вентиляции
	let spTime = (deltaTime * s.vent.add) / 100
	spTime = spTime > s.vent.max_add ? s.vent.max_add : spTime
	console.log('spTime', spTime, deltaTime)

	// 5. Включаем доп. вентиляцию
	idsS.forEach((idS) => {
		setACmd('fan', idS, {
			delay: s.fan.delay * 1000,
			type: 'on',
			force: null,
			max: null,
		})
	})

	// 6. Ожидаем окончания доп. вентиляции
	let time = compareTime(acc.byDur.queue[1].date, spTime)
	// Время работы ДВ не прошло
	if (!time) return


	// 7. Время работы ДВ прошло. Выключаем доп. вентиляцию
	idsS.forEach((idS) => {
		setACmd('fan', idS, {
			delay: s.fan.delay * 1000,
			type: 'off',
			force: null,
			max: null,
		})
	})
	acc.byDur.queue = []

}

module.exports = calc
