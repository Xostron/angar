const {checkOn, checkOff, regul, turnOn, turnOff} = require('./fn')
const { sensor } = require('@tool/command/sensor')
const { data: store } = require('@store')

/**
 * Плавный пуск ВНО в секции на контакторах
 * @param {string} bldId Id склада
 * @param {string} secId Id секции
 * @param {object} obj Глобальные данные склада
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {object[]} fans Информация по ВНО
 * @param {object} s Настройки склада
 * @param {object} seB Датчики склада (на всякий случай)
 * @param {number} номер секции
 * @returns
 */
function relay(bldId, secId, obj, aCmd, fans, s, seB, idx) {
	const { p } = sensor(bldId, secId, obj)
	// acc.count - Кол-во включенных вентиляторов (всегда один вентилятор в работе, независимо от давления в канале)
	// Изменяя данное число, регулируем порядком вкл/выкл вентиляторов для поддержания давления в канале
	store.watchdog.softFan[secId] ??= {}
	const acc = store.watchdog.softFan[secId]
	acc.count ??= 1
	acc.delay ??= new Date()

	console.log(
		444,
		`КМ: Склад ${bldId.slice(bldId.length - 4, bldId.length)} Секция ${idx}: `,
		`Авто = "${aCmd.type}",`,
		'Давление в канале =',
		p,
		'Задание по давлению',
		s.fan.pressure - s.fan.hysteresisP,
		'...',
		s.fan.pressure,
		'...',
		s.fan.pressure + s.fan.hysteresisP,
		acc.delay,
		aCmd.delay
	)

	// ****************** Авто: команда выкл ВНО секции ******************
	turnOff(fans, bldId, aCmd)

	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	let on = p < s.fan.pressure - s.fan.hysteresisP
	let off = p > s.fan.pressure + s.fan.hysteresisP

	// Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)
	// Антидребезг ВНО
	if (acc.stable) (on = false), (off = false)

	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, aCmd, fans.length)
	checkOff(off, acc, aCmd)

	// Непосредственное включение
	turnOn(fans, bldId, acc)
}

module.exports = relay
