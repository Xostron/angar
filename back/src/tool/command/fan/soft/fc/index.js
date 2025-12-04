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
const { isCombiCold } = require('@tool/combi/is')

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
	// Комби-холод. Управление ВНО
	const isCC = bld.type === 'combi' && isCombiCold(bld, bdata.automode, s) && !aCmd.force
	// При принудительном включении работаем ВНО как в обычном складу:
	// normal - обычный склад (по давлению канала)
	// cold - комби-холод (по темпе канала)
	const who = aCmd.force || s.coolerCombi?.on !== true ? 'normal' : where
	// Инициализация аккумулятора плавного пуска
	const acc = init(bld, idS, obj, bdata, s, who, 'fc', fans.length)

	// 1. Разрешение на работу
	if (turnOff(fanFC, fans, solHeat, bld, idS, obj, aCmd, acc, s, bdata, where)) return

	// 2. Регулирование по давлению/темпе канала
	let { on, off } = defOnOff[who](bld._id, idS, bdata.accAuto, obj, seS, s)
	console.log(110, idS, 'on', on, 'off', off)

	// Доп: Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)
	// Доп: Антидребезг ВНО (зафиксировать кол-во ВНО)
	if (acc.stable) (on = false), (off = false)
	console.log(111, 'on', on, 'off', off, who)
	// Доп: Комби-холод. Управление соленоидом подогрева
	acc.busySol = fnSolHeat(bld._id, acc, solHeat, on, off, obj, s, who)
	// Доп: Принудительное включение: расчет макс кол-ва ВНО
	const max = fnLimit(fanFC, aCmd)
	// 4. Регулирование ПЧ
	if (!acc.busySol) acc.busy = regul(acc, fanFC, on, off, s, aCmd, max, isCC)
	if (acc.busy || acc.busySol) (on = false), (off = false)
	console.log(112, 'on', on, 'off', off, who, isCC, max, aCmd.force)
	// 5. Регулирование Релейных ВНО: увеличение кол-ва
	checkOn(on, acc, s, fans.length, aCmd, max)
	// 5. Регулирование Релейных ВНО: уменьшение кол-ва
	checkOff.fc(off, acc)
	// 6. Непосредственное вкл/выкл
	turnOn(fanFC, fans, solHeat, bld._id, acc, max, off, isCC)
	// Доп: Комби-холод. Все вспомагательные механизмы подогрева канала запущены
	isAllStarted(acc, fans)
	console.table(acc)
}

module.exports = fc
