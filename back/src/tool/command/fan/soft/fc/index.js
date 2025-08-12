const defOnOff = require('../fn/on_off')
const checkOn = require('../fn/check_on')
const checkOff = require('../fn/check_off')
const turnOn = require('../fn/turn_on')
const turnOff = require('../fn/turn_off')
const regul = require('../fn/regul')
const init = require('../fn/init')
const fnSolHeat = require('../fn/sol_heat')
const isAllStarted = require('../fn/all_started')

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
function fc(bld, idS, obj, aCmd, fanFC, fans, solHeat, s, seB, seS, idx, bdata, where) {
	const bldId = bld._id
	const acc = init(bld, idS, obj, s, where, 'fc', fans.length)
	// ****************** Авто: команда выкл ВНО секции ******************
	if (turnOff(fanFC, fans, solHeat, bld, idS, obj, aCmd, acc, bdata, where)) return
	console.log(
		99003,
		aCmd,
		idS + where == 'normal' ? 'РАБОТА ПО ОБЫЧНОМУ СКЛАДУ' : 'РАБОТА ПО ХОЛОДИЛЬНИКУ'
	)

	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	let { on, off } = defOnOff[where](bld._id, idS, bdata.accAuto, obj, seS, s)
	// console.log(222, idS, 'on:', on, 'off:', off)
	// Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)
	// Антидребезг ВНО
	if (acc.stable) (on = false), (off = false)
	// Управление соленоидом подогрева
	acc.busySol = fnSolHeat(acc, solHeat, on, off, s, where)
	// Регулирование по ПЧ после ожидания соленоида подогрева
	if (!acc.busySol) acc.busy = regul(acc, fanFC, on, off, s, where)
	if (acc.busy || acc.busySol) (on = false), (off = false)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, fans.length)
	checkOff.fc(off, acc)
	// Непосредственное включение
	turnOn(fanFC, fans, solHeat, bldId, acc)
	console.log(333,'=============', idS, where, acc)
	// Все вспомагательные механизмы подогрева канала запущены
	isAllStarted(acc, fans)
}

module.exports = fc
