const { data: store } = require('@store')
const _RAMP = 5000

/**
 * Инициализация аккумулятора для управления ВНО
 * acc.order - номер текущего ВНО (от 0 до n) (мин кол-во включенных ВНО = 1)
 * Изменяя данное число, регулируем порядком вкл/выкл вентиляторов
 * для поддержания давления в канале
 * @param {object[]} fans ВНО секции допущенные к управлению
 * @param {string} secId id секции
 * @returns {object} Аккумулятор секции
 */
function fc(secId, s, where) {
	store.watchdog.softFan[secId] ??= {}
	const a = store.watchdog.softFan[secId]
	// Номер текущего ВНО
	a.order ??= -1
	// Точка отсчета
	a.date ??= new Date()
	// true - 1 этап соленоид подогрева, false - 1 этап пройден -> регулирование по ПЧ
	a.busySol ??= false
	a.sol ??= {}
	a.sol.value ??= false
	a.sol.date ??= new Date()
	// true - 2 этап ПЧ, false - 2 этап пройден -> регулирование по реле
	a.busy ??= false
	// Задание главного ВНО с ПЧ
	a.fc ??= {}
	a.fc.value ??= false
	a.fc.sp ??= 0
	a.fc.date ??= new Date()
	if (where == 'cold') {
		a.delaySolHeat = s.fan.wait * 1000
		a.delayFC = a.delaySolHeat
		a.delayRelay = a.delaySolHeat
	} else {
		a.delaySolHeat = s.fan.wait * 1000
		a.delayFC = s.fan.next * 1000
		a.delayRelay = s.fan.delay * 1000 + _RAMP
	}
	return a
}

function relay(secId, s, where) {
	store.watchdog.softFan[secId] ??= {}
	const a = store.watchdog.softFan[secId]
	// Номер текущего ВНО
	a.order ??= 0
	// Точка отсчета
	a.date ??= new Date()
	// true - 1 этап соленоид подогрева, false - 1 этап пройден -> регулирование по ПЧ
	a.busySol ??= false
	a.sol ??= {}
	a.sol.value ??= false
	a.sol.date ??= new Date()
	// true - регулирование по ПЧ, false - регулирование по кол-ву ВНО
	a.busy = false
	// Задание главного ВНО с ПЧ
	a.fc = undefined
	if (where == 'cold') {
		a.delaySolHeat = s.fan.wait * 1000
		a.delayFC = a.delaySolHeat
		a.delayRelay = a.delaySolHeat
	} else {
		a.delaySolHeat = s.fan.wait * 1000
		a.delayFC = s.fan.next * 1000
		a.delayRelay = s.fan.delay * 1000 + _RAMP
	}
	return a
}

const init = {
	fc,
	relay,
}

module.exports = init
