const defOnOff = require('../fn/on_off')
const checkOn = require('../fn/check_on')
const checkOff = require('../fn/check_off')
const turnOff = require('../fn/turn_off')
const turnOn = require('../fn/turn_on')
const init = require('../fn/init')
const fnSolHeat = require('../fn/sol_heat')
const isAllStarted = require('../fn/all_started')

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
function relay(bld, idS, obj, aCmd, fanFC, fans, solHeat, s, seB, seS, idx, bdata, where) {
	const bldId = bld._id
	const acc = init(bld, idS, obj, s, where, 'relay', fans.length)
	// ****************** Авто: команда выкл ВНО секции ******************
	if (turnOff(null, fans, solHeat, bld, idS, obj, aCmd, acc, s, bdata, where)) return
	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления/темп в канале (сигнал на вкл/откл вентиляторов)
	let { on, off } = defOnOff[where](bld._id, idS, bdata.accAuto, obj, seS, s)
	// console.log(2221, idS, 'on:', on, 'off:', off)
	// Прогрев клапанов
	if (aCmd.warming) {
		on = true
		off = false
		console.log('\tВключен прогрев клапанов')
	}
	// Антидребезг ВНО
	if (acc.stable) {
		on = false
		off = false
		console.log('\tВключен Антидребезг, поэтому ВНО работают на постоянке')
	}
	// Управление соленоидом подогрева
	acc.busySol = fnSolHeat(bldId, acc, solHeat, on, off, obj, s, where)
	if (acc.busySol) {
		on = false
		off = false
		console.log(
			'\tЖдем соленоиды подогрева (Настройка ВНО:Время подключения доп. вентилятора (Т канала))'
		)
	}
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, fans.length)
	checkOff.relay(off, acc, where)
	// Непосредственное включение
	turnOn(null, fans, solHeat, bldId, acc)
	// Все вспомагательные механизмы подогрева канала запущены
	isAllStarted(acc, fans)
	console.table(acc)
}

module.exports = relay
