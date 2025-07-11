const { checkOn, defOnOff } = require('./fn/fn')
const checkOff = require('./fn/check_off')
const turnOff = require('./fn/turn_off')
const turnOn = require('./fn/turn_on')
const { data: store } = require('@store')
const init = require('./fn/init')
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
function relay(bld, idS, obj, aCmd, fanFC, fans, s, seB, seS, idx, bdata, where) {
	const bldId = bld._id
	const acc = init.relay(idS)
	// ****************** Авто: команда выкл ВНО секции ******************
	if (turnOff(null, fans, bld, idS, aCmd, acc, bdata, where)) return

	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления/темп в канале (сигнал на вкл/откл вентиляторов)
	let { on, off } = defOnOff[where](bld._id, idS, bdata.accAuto, obj, seS, s)

	// Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)
	// Антидребезг ВНО
	if (acc.stable) (on = false), (off = false)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, aCmd, fans.length)
	checkOff.relay(off, acc, aCmd, where)
	// console.log(990011, on,off)
	// Непосредственное включение
	turnOn(null, fans, bldId, acc)

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
