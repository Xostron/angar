const { data: store, readAcc } = require('@store')
const { mechB } = require('@tool/command/mech')
const { sensorBuilding } = require('@tool/command/section/sensor')
const setting = require('@control/auto/setting')
const { ctrlFSoft, fnFan, fnFanWarm } = require('@tool/command/fan/auto')

// Собрать первичные данные по складу
function scan(bld, obj) {
	const { data, retain } = obj
	// Запущен ли склад (сброс доп. аварий авторежима)
	const start = retain?.[bld._id]?.start
	// Режим работы склада (сушка, лечение и т.д.)
	const automode = retain?.[bld._id]?.automode
	// Все настройки склада
	const s = setting(bld, obj)
	// Показания с датчиков по складу (без учета секций)
	const se = sensorBuilding(bld._id, obj)
	// Исполнительные механизмы по складу (без учета секций)
	const m = mechB(bld._id, obj)
	// Аккумулятор для хранения промежуточных вычислений (авторежим)
	const t = bld?.type == 'normal' ? (automode ?? bld?.type) : bld?.type
	const accAuto = readAcc(bld._id, t)
	const supply =  store?.acc[bld._id]?.building?.supply
	// Напорные вентиляторы всех секций
	const resultFan = {
		start: [],
		list: [],
		fan: [],
		warming: {},
	}
	return { start, automode, s, se, m, accAuto, resultFan, supply }
}

/**
 * Для секций в авторежиме: если у одной секции формируется сигнал на включение вент (2я секция в авторежиме - вент остановлены),
 * включается вентиляторы на всех секциях в авторежиме
 * @param {*} bld склад
 * @param {*} resultFan задание на включение напор.вент.
 * @param {*} s настройки склада
 */


function fan(bld, resultFan, s, retain) {
	fnFan(resultFan.start.includes(true), resultFan, s, bld._id, retain)
	// Прогрев клапанов
	if (!resultFan.start.includes(true)) fnFanWarm(resultFan, s)

	// Непосредственное включение вентиляторов (ступенчато)
	ctrlFSoft(resultFan, bld._id)
}
module.exports = { scan, fan }
