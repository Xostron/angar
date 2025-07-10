const { compareTime } = require('@tool/command/time')
const { sensor } = require('@tool/command/sensor')
const { data: store } = require('@store')
const _RAMP = 5000

/**
 * Логика плавного пуска ВНО
 * @param {boolean} on Давление в канала меньше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {number} length Кол-во вентиляторов в секции
 * @returns
 */
function checkOn(on, acc, aCmd, length) {
	if (!on) return
	// Проверка времени (время на стабилизацию давления в канале, после drk DYJ)
	const time = aCmd.delay + _RAMP
	if (!compareTime(acc.date, time)) return
	// Включаем следующий ВНО
	if (++acc.order >= length - 1) {
		acc.order = length - 1
		return
	}
	// Новая точка отсчета
	acc.date = new Date()
}

// Команды Вкл/выкл ВНО в зависимости от показателей канала
const defOnOff = {
	// Для обычного склада и комби(обычный режим)
	normal: (idB, idS, accAuto, obj, seS, s) => {
		const { p } = sensor(idB, idS, obj)
		let on = p < s.fan.pressure.p - s.fan.hysteresisP
		let off = p > s.fan.pressure.p + s.fan.hysteresisP
		return { on, off }
	},
	// Комби (режим холодильника)
	cold: (idB, idS, accAuto, obj, seS, s) => {
		let on = seS.tcnl < accAuto.cold.tgtTcnl - s.cooling.hysteresisIn
		let off = seS.tcnl > accAuto.cold.tgtTcnl
		return { on, off }
	},
}
module.exports = { checkOn, defOnOff }
