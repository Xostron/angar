const { data: store } = require('@store')
const { turnOff, turnOn, checkOff_FC, checkOff_Relay, checkOn, regul } = require('./fn')

/**
 * Плавный пуск ВНО в секции на контакторах
 * @param {string} bldId Id склада
 * @param {string} idS Id секции
 * @param {object} obj Глобальные данные склада
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {object[]} fans Информация по ВНО
 * @param {object} s Настройки склада
 * @param {object} seB Датчики склада (на всякий случай)
 * @param {number} номер секции
 * @returns
 */
function relay(idB, idS, fan, obj, s, se, start) {
	// Аккумулятор
	store.heap.smoking ??= {}
	store.heap.smoking[idS] ??= {}
	const acc = store.heap.smoking[idS]
	// Точка отсчета вкл/выкл ВНО
	acc.date ??= new Date()
	acc.busy ??= false
	// Номер текущего ВНО
	acc.order ??= 0
	// Задание главного ВНО с ПЧ
	acc.fc = undefined
	acc.delayFC = s.fan.next * 1000
	acc.delayRelay = s.fan.delay * 1000 //+ _RAMP
	// ****************** ВЫКЛ ВНО (команда || секция не в авто) ******************
	if (turnOff(idB, idS, fan, start)) return

	// ****************** ВКЛ ВНО ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	const { p } = se
	let on = p < s.fan.pressure.p - s.fan.hysteresisP
	let off = p > s.fan.pressure.p + s.fan.hysteresisP
	console.log(2, idS, 'ПП: давление', 'on=', on, 'off=', off)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, fan.fans.length)
	checkOff_Relay(off, acc)
	// ВКЛ
	turnOn(fan, idB, acc)
	console.log(3, idS)
}

/**
 *
 * @param {*} idB Id склада
 * @param {*} idS Id секции
 * @param {*} fan {fanFC,fans,type,mode}
 * @param {*} obj Глобальные данные
 * @param {*} s Настройки
 * @param {*} se Датчики секции
 * @param {*} start Команда вкл/выкл
 * @returns
 */
function fc(idB, idS, fan, obj, s, se, start) {
	// Аккумулятор
	store.heap.smoking ??= {}
	store.heap.smoking[idS] ??= {}
	const acc = store.heap.smoking[idS]
	acc.date ??= new Date()
	acc.busy ??= false
	// Номер текущего ВНО
	acc.order ??= -1
	// Задание главного ВНО с ПЧ
	acc.fc ??= {}
	acc.fc.value ??= false
	acc.fc.sp ??= 0
	acc.fc.date ??= new Date()
	acc.delayFC = s.fan.next * 1000
	acc.delayRelay = s.fan.delay * 1000 //+ _RAMP
	// ****************** ВЫКЛ ВНО (команда || секция не в авто) ******************
	if (turnOff(idB, idS, fan, start)) return
	// ****************** ВКЛ ВНО ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	const { p } = se
	let on = p < s.fan.pressure.p - s.fan.hysteresisP
	let off = p > s.fan.pressure.p + s.fan.hysteresisP
	console.log(2, idS, 'ПП: давление', 'on=', on, 'off=', off)

	// Регулирование по ПЧ после ожидания соленоида подогрева
	acc.busy = regul(acc, fan.fanFC, on, off, s)
	if (acc.busy) (on = false), (off = false)
	console.log(3, idS, 'ПП', 'on=', on, 'off=', off)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, fan.fans.length)
	checkOff_FC(off, acc)
	// ВКЛ
	turnOn(fan, idB, acc)
}

module.exports = { fc, relay }

