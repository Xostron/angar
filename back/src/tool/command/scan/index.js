const { sensorBuilding } = require('@tool/command/section/sensor')
const { data: store, readAcc } = require('@store')
const setting = require('@control/extra/setting')
const { mechB } = require('@tool/command/mech')

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
	const t = bld?.type == 'normal' ? automode ?? bld?.type : bld?.type
	const accAuto = readAcc(bld._id, t)
	// readAcc(bld._id, t)
	// console.log(444, t)
	// store.acc[bld._id] ??= {}
	// store.acc[bld._id][t] ??= {}
	//  accAuto = store?.acc?.[bld._id]?.[t]
	const supply = store.acc[bld._id]?.building?.supply
	// Напорные вентиляторы всех секций
	const resultFan = {
		start: [],
		list: [],
		fan: [],
		warming: {},
	}
	return { start, automode, s, se, m, accAuto, resultFan, supply }
}

module.exports = scan
