const { wrAchieve, delAchieve, updAchieve } = require('@tool/message/achieve')
const { sensorBuilding } = require('@tool/command/sensor')
const { elapsedTime } = require('@tool/command/time')
const { data: store, readAcc } = require('@store')
const setting = require('@control/extra/setting')
const { mechB } = require('@tool/command/mech')
const { msgB } = require('@tool/message')
const mes = require('@dict/message')

// Собрать первичные данные по складу
function scan(bld, obj) {
	const { data, retain } = obj
	// Запущен ли склад (сброс доп. аварий авторежима)
	const start = retain?.[bld._id]?.start ?? false
	// Режим работы склада (сушка, лечение и т.д.)
	const automode = retain?.[bld._id]?.automode
	// Все настройки склада
	const s = setting(bld, obj)
	// Показания с датчиков по складу (без учета секций)
	const se = sensorBuilding(bld._id, obj)
	// Исполнительные механизмы по складу (без учета секций)
	const m = mechB(bld?._id, bld?.type, obj)
	// console.log(333,m)
	// Аккумулятор для хранения промежуточных вычислений (авторежим)
	const t = bld?.type == 'normal' ? automode ?? bld?.type : bld?.type
	const accAuto = readAcc(bld._id, t)
	const supply = store?.acc[bld._id]?.building?.supply
	// Напорные вентиляторы всех секций
	const resultFan = {
		start: [],
		list: [],
		fan: [],
		warming: {},
	}
	// Для всех складов (Нормальный, холодильник, комби)
	// Событие Выключен 00ч 00м назад

	if (!start && !accAuto.datestop) {
		accAuto.datestop = true
		wrAchieve(bld._id, 'building', msgB(bld, 151))
	}
	if (start) {
		accAuto.datestop = null
		delAchieve(bld._id, 'building', mes[151].code)
	}
	if (accAuto.datestop) {
		const elapsed = elapsedTime(obj.retain?.[bld._id]?.datestop ?? null)
		const msg = elapsed ? mes[151].msg + ' ' + elapsed : null
		if (msg) updAchieve(bld._id, 'building', 'datestop', { msg })
	}
	return { start, automode, s, se, m, accAuto, resultFan, supply }
}

module.exports = scan
