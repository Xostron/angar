const { ctrlB } = require('@tool/command/fan')

// Разгонные вентиляторы: Вкл
function on(building, fanA) {
	fanA.forEach((f) => {
		ctrlB(f, building._id, 'on')
	})
}
// Разгонные вентиляторы: Выкл
function off(building, fanA) {
	fanA.forEach((f) => {
		ctrlB(f, building._id, 'off')
	})
}
// Разгонные вентиляторы: По времени
function time(building, fanA, acc, se, s) {
	const cur = +new Date().getTime()
	// Фиксируем время работы
	if (!acc?.work) acc.work = cur + s.accel.work / 1

	// Вентиляторы в работе
	if (acc.work > cur) on(building._id, fanA)

	// Фиксируем время ожидания
	if (acc.work < cur && !acc.wait) acc.wait = cur + s.accel.wait / 1

	if (acc.work && acc.wait > cur) off(building._id, fanA)

	if (acc.work && acc.wait < cur) {
		delete acc.work
		delete acc.wait
	}
}

// Разгонные вентиляторы: По температуре
function temp(building, fanA, acc, se, s) {
	const { tprd, tin } = se
	const hyst = 0.3
	// Отключено
	if (tprd == null || tin == null) return off(building._id, fanA)

	// Вкл
	if (tprd - tin > s.accel.difference) on(building._id, fanA)

	// Выкл
	if (tprd - tin + hyst < s.accel.difference) off(building._id, fanA)
}

module.exports = {
	on,
	time,
	temp,
	off,
}
