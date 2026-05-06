const turnOff = require('./def/turn_off')
const supply = require('./def/supply')
const all = require('./def/all')
const fnModule = require('./def/module')

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
	let r = supply(idB, obj)
	// console.log(5500, 'r', r)
	if (r) return [r]

	// Формирование актуального списка пушей
	r = all(idB, obj)

	// Отфильтровать аварии возникшие из-за неисправности модулей
	r = fnModule(idB, obj, r)
	// console.log(1144, r)
	return r
}

module.exports = push
