const on = require('./on')
const off = require('./off')
const always = require('./always')
const { mech } = require('@tool/command/mech')
const { sensor } = require('@tool/command/sensor')
const { sumExtralrmSection } = require('@tool/message/extralrm')
const clear = require('@tool/clear')
/**
 *
 * @param {*} start Вкл/выкл склад
 * @param {*} bld Склад
 * @param {*} obj Данные по складу
 * @param {*} s Настройки
 * @param {*} am Авторежим склада
 * @param {*} accAuto Промежуточные вычислинения авторежимов
 * @param {*} resultFan Для управления напорными вентиляторыми секций
 * @param {boolean} alrBld Аварии склада extralrms
 * @param {boolean} alrAm Аварии склада extralrms
 * @param {*} seB Датчики склада и усредненные значения по всем секциям
 */
function section(start, bld, obj, s, am, accAuto, resultFan, alrBld, alrAm, seB) {
	const { data, retain } = obj
	let alrAlw

	const sections = data.section.filter((el) => (el.buildingId = bld._id))
	// Секции склада
	for (const sect of sections) {
		if (sect.buildingId != bld._id) continue
		// Исполнительные механизмы секции
		const m = mech(obj.data, sect._id, sect.buildingId)
		// Показания с датчиков секции
		const se = sensor(bld._id, sect._id, obj)
		// Секция в любом режиме
		alrAlw = always(bld, sect, obj, s, se, m, am, accAuto, resultFan, alrBld)
		// sumExtralrmSection(building, section) - Аварии возникающие в секции, но останавливающие работу всего склада
		sumAlrS = sumExtralrmSection(bld, obj)
		// Склад включен, секция в авто
		on(bld, sect, obj, s, se, seB, m, am, accAuto, resultFan, start, alrBld || sumAlrS, alrAm, alrAlw)
		// Склад выключен, секция не в авто
		off(bld, sect, obj, s, se, m, am, accAuto, resultFan, start, alrBld)
	}
	// Если все секции не в авто - очистка аккумулятора
	const isAllSectOff = sections.every((el) => !retain?.[bld._id]?.mode?.[el._id])
	clear(bld,obj, accAuto, isAllSectOff, start)
	// Если склад выключен - очистка аккумулятора
}

module.exports = section
