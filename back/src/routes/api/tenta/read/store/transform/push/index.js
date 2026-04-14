const turnOff = require('./def/turn_off')
const supply = require('./def/supply')
const all = require('./def/all')

/**
 *
 * @param {*} idB ИД Склада
 * @param {*} obj Глобальные данные
 * @returns {object[]} Массив пуш-сообщений
 */
function push(idB, section, obj) {
	// Cекции и склад выключены - запрет отправки пушей
	if (turnOff(idB, section, obj)) return

	// Обнаружена авария питания
	const r = supply(idB, obj)
	// console.log(5500, 'r', r)
	if (r) return [r]

	// Формирование актуального списка пушей
	return all(idB, obj)
}

module.exports = push
