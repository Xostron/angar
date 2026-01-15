const { fnBattery, find } = require('./fn')

/**
 *
 * @param {*} idB ИД Склада
 * @param {*} data
 * @returns {object[]} Массив пуш-сообщений
 */
function push(idB, data) {
	// Обнаружена авария питания
	const r = fnBattery(idB, data)
	// console.log(5500, 'r', r)
	if (r) return r

	// Формирование актуального списка пушей
	return find(idB, data)
}

module.exports = push
