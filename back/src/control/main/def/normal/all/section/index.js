const on = require('./on')
const off = require('./off')
const always = require('./always')
const { mech } = require('@tool/command/mech')
const { sensor } = require('@tool/command/section/sensor')
/**
 *
 * @param {*} start Вкл/выкл склад
 * @param {*} building Склад
 * @param {*} obj Данные по складу
 * @param {*} s Настройки
 * @param {*} am Авторежим склада
 * @param {*} accAuto Промежуточные вычислинения авторежимов
 * @param {*} resultFan Для управления напорными вентиляторыми секций
 * @param {*} alrB Аварии склада
 * @param {*} seB Датчики склада и усредненные значения по всем секциям
 */
function section(start, building, obj, s, am, accAuto, resultFan, alrB, seB) {
	const { data } = obj
	const alr = {}
	// Секции склада
	for (const sect of data.section) {
		if (sect.buildingId != building._id) continue
		// Исполнительные механизмы секции
		const m = mech(obj.data, sect._id)
		// Показания с датчиков секции
		const se = sensor(building._id, sect._id, obj)
		// Секция и склад в любом режиме
		alr.always = always(building, sect, obj, s, se, m, am, accAuto, resultFan, alrB)
		// Склад включен, секция в авто
		on(building, sect, obj, s, se, seB, m, am, accAuto, resultFan, start, alrB, alr.always)
		// Склад выключен, секция не в авто
		off(building, sect, obj, s, se, m, am, accAuto, resultFan, start, alrB)
	}
}

module.exports = section
