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
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	// TODO для комбинированного склада увеличенное время?
	const time = aCmd.delay + _RAMP
	// if (acc.date)
	if (!compareTime(acc.date, time)) {
		// console.log(555, `Ожидайте пока выровнится давление после вкл ВНО`, time)
		return
	}
	// Включаем следующий ВНО
	if (++acc.order >= length - 1) {
		acc.order = length - 1
		return
	}
	// Новая точка отсчета
	acc.date = new Date()
	console.log(111, 'Вкл ВНО и фиксирую новое время', acc.date)
}

/**
 * Логика плавного останова ВНО
 * @param {boolean} off Давление в канале выше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Авто - команда на вкл/выкл ВНО
 * @returns
 */
function checkOff(off, acc, aCmd) {
	if (!off) return
	const time = aCmd.delay
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	if (!compareTime(acc.date, time)) {
		// console.log(22, `Ожидайте пока выровнится давление после откл ВНО`)
		return
	}
	if (--acc.order <= -1) {
		acc.order = -1
		return
	}
	acc.date = new Date()
	console.log(222, 'Выкл ВНО и фиксирую новое время', acc.date)
}

/**
 * Инициализация аккумулятора для управления ВНО
 * acc.order - номер текущего ВНО (от 0 до n) (мин кол-во включенных ВНО = 1)
 * Изменяя данное число, регулируем порядком вкл/выкл вентиляторов
 * для поддержания давления в канале
 * @param {object[]} fans ВНО секции допущенные к управлению
 * @param {string} secId id секции
 * @returns {object} Аккумулятор секции
 */
function init(secId, s) {
	store.watchdog.softFan[secId] ??= {}
	const a = store.watchdog.softFan[secId]
	// Номер текущего ВНО
	a.order ??= -1
	// Точка отсчета
	a.date ??= new Date()
	// true - регулирование по ПЧ, false - регулирование по кол-ву ВНО
	a.busy ??= false
	// Задание главного ВНО с ПЧ
	a.fc ??= s.fan.min ?? 20
	return a
}

// Вкл/выкл в зависимости от показателей канала
const defOnOff = {
	// для обычного склада и комби(обычный режим)
	normal: (idB, idS, accAuto, obj, seS, s) => {
		const { p } = sensor(idB, idS, obj)
		let on = p < s.fan.pressure.p - s.fan.hysteresisP
		let off = p > s.fan.pressure.p + s.fan.hysteresisP
		return { on, off }
	},
	// комби (режим холодильника)
	cold: (idB, idS, accAuto, obj, seS, s) => {
		let on = seS.tcnl < accAuto.cold.tgtTcnl - s.cooling.hysteresisIn
		let off = seS.tcnl > accAuto.cold.tgtTcnl
		return { on, off }
	},
}
module.exports = { checkOn, checkOff, init, defOnOff }
