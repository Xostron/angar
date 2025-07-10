const { checkOn, defOnOff } = require('./fn/fn')
const checkOff = require('./fn/check_off')
const turnOn = require('./fn/turn_on')
const turnOff = require('./fn/turn_off')
const regul = require('./fn/regul')
const { data: store } = require('@store')
const init = require('./fn/init')
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
function fc(bld, idS, obj, aCmd, fanFC, fans, s, seB, seS, idx, bdata, where) {
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
	// Регулирование по ПЧ
	acc.busy = regul(acc, fanFC, on, off, s, where)
	if (acc.busy) (on = false), (off = false)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, aCmd, fans.length)
	checkOff.fc(off, acc, aCmd)
	// Непосредственное включение
	turnOn(fanFC, fans, bldId, acc)
	// console.log(
	// 	444,
	// 	`FC: Склад ${bldId.slice(bldId.length - 4, bldId.length)} Секция ${idx}: `,
	// 	`Авто = "${aCmd.type}",`,
	// 	`ПЧ busy = `,
	// 	acc.busy,
	// 	acc.fc,
	// 	'#ВНО =',
	// 	acc.order
	// )
}

module.exports = fc
