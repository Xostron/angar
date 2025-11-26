const defOnOff = require('../fn/on_off')
const checkOn = require('../fn/check_on')
const checkOff = require('../fn/check_off')
const turnOn = require('../fn/turn_on')
const turnOff = require('../fn/turn_off')
const regul = require('../fn/regul')
const init = require('../fn/init')
const fnSolHeat = require('../fn/sol_heat')
const isAllStarted = require('../fn/all_started')
const { fnLimit } = require('../fn/vent')
const { isCombiCold} = require('@tool/combi/is')
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
	const who = aCmd.force ? 'normal' : where
	// Склад комби-холод, работа по темпе канала
	const isCC = isCombiCold(bld, bdata.automode, s) && !aCmd.force
	const bldId = bld._id
	const acc = init(bld, idS, obj, s, who, 'fc', fans.length)
	// ****************** Авто: команда выкл ВНО секции ******************
	if (turnOff(fanFC, fans, solHeat, bld, idS, obj, aCmd, acc, s, bdata, where)) return

	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	let { on, off } = defOnOff[who](bld._id, idS, bdata.accAuto, obj, seS, s)
	console.log(110, 'on', on, 'off', off)
	// Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)
	// Антидребезг ВНО
	if (acc.stable) (on = false), (off = false)
	console.log(111, 'on', on, 'off', off, who)
	// Управление соленоидом подогрева
	acc.busySol = fnSolHeat(bld._id, acc, solHeat, on, off, obj, s, who)

	const max = fnLimit(fanFC, aCmd)
	// Регулирование по ПЧ после ожидания соленоида подогрева
	if (!acc.busySol) acc.busy = regul(acc, fanFC, on, off, s, aCmd, max, who)
	if (acc.busy || acc.busySol) (on = false), (off = false)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, s, fans.length, aCmd, max)
	checkOff.fc(off, acc)
	// Непосредственное включение
	turnOn(fanFC, fans, solHeat, bldId, acc, max, off, isCC)
	// Все вспомагательные механизмы подогрева канала запущены
	isAllStarted(acc, fans)
	console.table(acc)
}

module.exports = fc
