const { checkOn, defOnOff } = require('./fn/fn')
const checkOff = require('./fn/check_off')
const turnOn = require('./fn/turn_on')
const turnOff = require('./fn/turn_off')
const regul = require('./fn/regul')
const init = require('./fn/init')
const fnSolHeat = require('./fn/sol_heat')

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
	const acc = init.fc(idS)
	// ****************** Авто: команда выкл ВНО секции ******************
	if (turnOff(fanFC, fans, bld, idS, aCmd, acc, bdata, where)) return
	// ****************** Авто: команда вкл ВНО секции ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	let { on, off } = defOnOff[where](bld._id, idS, bdata.accAuto, obj, seS, s)
	// Прогрев клапанов
	if (aCmd.warming) (on = true), (off = false)
	// Антидребезг ВНО
	if (acc.stable) (on = false), (off = false)

	console.log(222, idS, where, solHeat)
	acc.busySol = fnSolHeat(acc, solHeat, on, off, s, where)

	// Регулирование по ПЧ
	if (!acc.busySol) acc.busy = regul(acc, fanFC, on, off, s, where)
	if (acc.busy || acc.busySol) (on = false), (off = false)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, aCmd, fans.length)
	checkOff.fc(off, acc, aCmd)
	// Непосредственное включение
	turnOn(fanFC, fans, solHeat, bldId, acc)
}

module.exports = fc


