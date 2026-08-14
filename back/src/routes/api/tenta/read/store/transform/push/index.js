const turnOff = require('./def/turn_off')
const supply = require('./def/supply')
const all = require('./def/all')
const fnModule = require('./def/module')
const rdDrying = require('./def/report_day_drying')

/**
 * Пуш-сообщения
 * @param {*} idB ИД Склада
 * @param {*} obj Глобальные данные
 * @returns {object[]} Массив пуш-сообщений
 */
function push(idB, section, obj) {
	// Cекции и склад выключены - запрет отправки пушей
	if (turnOff(idB, section, obj)) return

	// Обнаружена авария питания (остальные аварии игнорируются)
	let r = supply(idB, obj)
	// console.log(5500, 'r', r)
	if (r) return [r]

	// Формирование актуального списка пушей (все критические аварии)
	r = all(idB, obj)

	// Отфильтровать аварии возникшие из-за неисправности модулей
	r = fnModule(idB, obj, r)
	// console.log(1144, r)

	// Добавить отчет суточной сушки в 8:00
	const t = rdDrying(idB, section, obj)
	if (t) r.push(t)

	return r
}

module.exports = push
