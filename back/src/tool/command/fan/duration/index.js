const fnPrepare = require('./prepare')
const calc = require('./calc')
const { fnCheck } = require('./check')

/**
 * Дополнительная вентиляция
 * Управление плавным пуском зависит от resultFan.start - вкл/выкл ВНО и
 * resultFan.force - принудительное вкл ВНО (удаление СО2, внутр вентиляция)
 * resultFan.notDur - это аварии секции и склада, которые выкл плавный пуск,
 * которая состоит из антивьюги, и других аварий.
 * Итог мы прогоняем resultFan и продлеваем ему resultFan.start на доп вентиляцию.
 * Во время доп вентиляции за ее останов по аварийным причинам отвечает fnCheck.
 *
 * После влияния доп. вентиляции, resultFan прогоняется по основному алгоритму fnACmd.
 *
 * @param {*} bld Рама склада
 * @param {*} obj Глобальные данные
 * @param {*} s Настройки
 * @param {*} seB Датчики склада
 * @param {*} m Исполнительные механизмы склада
 * @param {*} resultFan Управление плавным пуском
 * @param {*} bdata Сбор данных по складу
 */
function durVent(bld, obj, s, seB, m, resultFan, bdata) {
	console.log('\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n')
	// Подготовка данных
	const prepare = fnPrepare(bld, obj, s, resultFan, bdata)
	console.log('\tacc', prepare.acc.byDur)
	console.log(5500, '\tcmd', prepare.cmd)
	// Разрешение на работу
	if (!fnCheck(bld, prepare)) return
	// Расчет доп вентиляции и работа
	calc(bld, prepare, resultFan)
	console.log('\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n')
}

module.exports = durVent
