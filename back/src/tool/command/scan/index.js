const { sensorBuilding } = require('@tool/command/sensor')
const { data: store, readAcc } = require('@store')
const { mechB } = require('@tool/command/mech')

/**
 * Собрать первичные данные по складу
 * @param {object} bld Рама склада
 * @param {object} obj Глобальные данные
 * @returns {object} bdata = { start (склад запущен), automode (авторежим: сушка, харенение),
 * mode (режимы работ секций), s (настройки), se (датчики склада, не по секции), m (механизмы склада),
 * accAuto (аккумулятор авторежима), resultFan (аккумулятор плавного пуска ВНО),
 * supply (для холодильника - флаг питания) }
 */
function scan(bld, obj) {
	const { data, retain } = obj
	// Запущен ли склад (сброс доп. аварий авторежима)
	const start = retain?.[bld._id]?.start ?? false
	// Режимы работы секций
	const mode = retain?.[bld._id]?.mode
	// Режим работы склада (сушка, лечение и т.д.)
	const automode = retain?.[bld._id]?.automode
	// Все настройки склада
	const s = store.calcSetting[bld._id]

	// Показания с датчиков по складу (без учета секций)
	const se = sensorBuilding(bld._id, obj)

	// Исполнительные механизмы по складу (без учета секций)
	const m = mechB(bld?._id, bld?.type, obj)

	// Аккумулятор для хранения промежуточных вычислений (авторежим)
	const t = bld?.type == 'normal' ? automode ?? bld?.type : bld?.type
	const accAuto = readAcc(bld._id, t)

	// TODO не используется
	const supply = null
	// const supply = store?.acc[bld._id]?.building?.supply

	// Напорные вентиляторы всех секций
	const resultFan = {
		start: [],
		list: [],
		fan: [],
		warming: {},
		force: [],
		stg: [],
		notDur: [],
	}

	return { start, automode, mode, s, se, m, accAuto, resultFan, supply }
}

module.exports = scan
