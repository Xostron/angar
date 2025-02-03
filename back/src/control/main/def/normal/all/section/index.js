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
 * @param {boolean} alrBld Аварии склада extralrms
 * @param {boolean} alrAm Аварии склада extralrms
 * @param {*} seB Датчики склада и усредненные значения по всем секциям
 */
function section(start, building, obj, s, am, accAuto, resultFan, alrBld, alrAm, seB) {
	const { data } = obj
	let alrAlw
	
	// Секции склада
	for (const sect of data.section) {
		if (sect.buildingId != building._id) continue
		// Исполнительные механизмы секции
		const m = mech(obj.data, sect._id)
		// Показания с датчиков секции
		const se = sensor(building._id, sect._id, obj)
		// Секция и склад в любом режиме
		alrAlw = always(building, sect, obj, s, se, m, am, accAuto, resultFan, alrBld)
		// Склад включен, секция в авто
		on(building, sect, obj, s, se, seB, m, am, accAuto, resultFan, start, alrBld, alrAm, alrAlw)
		// Склад выключен, секция не в авто
		off(building, sect, obj, s, se, m, am, accAuto, resultFan, start, alrBld)
	}
}

module.exports = section
