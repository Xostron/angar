const { arrCtrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')

// СО2: Вкл
function on(building, co2, value) {
	arrCtrlDO(building._id, co2, 'on')
}

// СО2: Выкл
function off(building, co2, value) {
	arrCtrlDO(building._id, co2, 'off')
}

// СО2: По времени
function time(building, co2, value, acc, se, s) {
	// Фиксируем время работы, вентиляторы - вкл
	if (!acc?.work || compareTime(acc.wait, s.co2?.wait?.w ?? 60000)) {
		acc.work = new Date()
		delete acc.wait
		on(building._id, co2)
	}

	// Время работы вентиляторов истекло - выкл
	if (compareTime(acc.work, s.co2.work) && !acc?.wait) {
		off(building._id, co2)
		acc.wait = new Date()
	}
	console.log('Удаление СO2 холодильник', acc, s.co2.wait)
}

// СО2: По датчику
function sens(building, co2, value, acc, se, s) {
	// Отключено
	if (se.cooler.co2 === null) return off(building._id, co2)

	// Вкл
	if (se.cooler.co2 > s.co2.sp) on(building._id, co2)

	// Выкл
	if (se.cooler.co2 + s.co2.hysteresis < s.co2.sp) off(building._id, co2)
}

module.exports = {
	on,
	time,
	sens,
	off,
}
