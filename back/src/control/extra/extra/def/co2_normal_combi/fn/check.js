const { isExtralrm } = require('@tool/message/extralrm')
const { isAchieve } = require('@tool/message/achieve')
const { delExtra } = require('@tool/message/extra')
const { isAlr } = require('@tool/message/auto')

/**
 * Проверка: в ДАННЫЙ МОМЕНТ ВРЕМЕНИ разрешено включить удаление СО2
 *
 * @param {object} bld Склад
 * @param {object} obj Глобальные данные
 * @param {object} acc Аккумулятор СО2
 * @param {object} o Подготовленные данные для СО2
 * @returns {boolean} true Разрешено удаление СО2
 */
function checkNow(bld, obj, acc, o) {
	const { vlvClose, point, tprd, co2, hout, outMax, valid, automode } = o
	// Температура продукта достигла задания
	const finish = isAchieve(bld._id, automode, 'finish')
	// Авария авторежима
	const alrAuto = isAlr(bld._id, automode)
	// Авария температура канала выше температуры продукта
	const openVin = isExtralrm(bld._id, null, 'openVin')
	const i1 = finish || alrAuto || openVin
	// Разрешение по точке росы
	let i2
	if (tprd - 1.5 > point) i2 = true
	if (tprd - 1 < point) i2 = false
	// Разрешение по уличной влажности
	const i3 = hout < outMax

	if (i1 && i2 && i3 && valid) {
		console.log('\t 2-Разрешено удаление СО2', 'i1', i1, 'i2', i2, 'i3', i3, 'valid', valid)
		return true
	}
	console.log('\t 2-Запрещено удаление СО2', 'i1', i1, 'i2', i2, 'i3', i3, 'valid', valid)
	return false
}

/**
 * Проверка: Был ли открыт клапан
 *
 * @param {object} bld Склад
 * @param {object} obj Глобальные данные
 * @param {object} acc Аккумулятор СО2
 * @param {object} o Подготовленные данные для СО2
 * @returns {boolean} true Разрешено удаление СО2
 */
function checkMain(bld, obj, acc, o) {
	// Если клапан был открыт - то запрет удаление СО2, и обнуление таймеров ожидания
	if (!o.vlvClose && !acc.work) {
		console.log('\t 1-Запрещено удаление СО2 (клапан открыт)')
		delExtra(bld._id, null, 'co2', 'co2wait')
		clear(acc, 'work', 'wait', 'start')
		return false
	}
	console.log('\t 1-Разрешено удаление СО2 (клапан закрыт)')
	return true
}

/**
 * Очистка аккумулятора
 * @param {*} acc
 * @param  {...any} args
 */
function clear(acc, ...args) {
	args.forEach((key) => (acc[key] = null))
}

module.exports = { checkNow, checkMain, clear }
