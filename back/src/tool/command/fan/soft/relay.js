const { checkOn, checkOff, regul, turnOn, turnOff, defOnOff } = require('./fn')
const { sensor } = require('@tool/command/sensor')
const { data: store } = require('@store')

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
function relay(bld, idS, obj, aCmd, fans, s, seB, seS, idx, bdata, where) {
	const bldId = bld._id
	const p = sensor(bldId, idS, obj)?.p
	// acc.count - Кол-во включенных вентиляторов (всегда один вентилятор в работе, независимо от давления в канале)
	// Изменяя данное число, регулируем порядком вкл/выкл вентиляторов для поддержания давления в канале
	store.watchdog.softFan[idS] ??= {}
	const acc = store.watchdog.softFan[idS]
	acc.order ??= 0
	acc.date ??= new Date()

	// ****************** Авто: команда выкл ВНО секции ******************
	if (turnOff(fans, bld, aCmd, acc, bdata, where)) return

	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	let { on, off } = defOnOff[where](bld._id, idS, bdata.accAuto, obj, seS, s)

	// Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)
	// Антидребезг ВНО
	if (acc.stable) (on = false), (off = false)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, aCmd, fans.length)
	checkOff(off, acc, aCmd)
	// console.log(990011, on,off)
	// Непосредственное включение
	turnOn(fans, bldId, acc)

	// console.log(
	// 	444,
	// 	`КМ: Склад ${bldId.slice(bldId.length - 4, bldId.length)} Секция ${idx}: `,
	// 	`Авто = "${aCmd.type}",`,
	// 	'Давление в канале =',
	// 	p,
	// 	'Задание по давлению',
	// 	s.fan.pressure.p - s.fan.hysteresisP,
	// 	'...',
	// 	s.fan.pressure.p,
	// 	'...',
	// 	s.fan.pressure.p + s.fan.hysteresisP,
	// 	acc.delay,
	// 	aCmd.delay
	// )
}

module.exports = relay
