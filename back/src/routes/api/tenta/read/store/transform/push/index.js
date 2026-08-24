const turnOff = require('./def/turn_off')
const supply = require('./def/supply')
const all = require('./def/all')
const fnModule = require('./def/module')
const rdDrying = require('./def/report_day_drying')
const reportWeek = require('./def/report_week')

/**
 * Пуш-сообщения
 * @param {*} idB ИД Склада
 * @param {*} obj Глобальные данные
 * @returns {object[]} Массив пуш-сообщений
 */
async function push(idB, section, obj) {
	// Cекции и склад выключены - запрет отправки пушей
	if (turnOff(idB, section, obj)) return

	// Пуш Авария питания (остальные игнорируются)
	let r = supply(idB, obj)
	if (r) return [r]

	// Пуши критические аварии (флаг count)
	r = all(idB, obj)

	// Фильтр критических аварии, связанные с неисправным модулем
	r = fnModule(idB, obj, r)

	// Добавить отчет суточной сушки (каждый день в 8:00)
	const dd = rdDrying(idB, section, obj)
	if (dd) r.push(dd)

	// Добавить недельный отчет (каждый понедельник в 8:00)
	const week = await reportWeek(idB, section, obj)
	if (week) r.push(week)

	return r
}

module.exports = push
