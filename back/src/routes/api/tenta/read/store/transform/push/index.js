const { isAS } = require('@tool/get/building')
const { fnBattery, find } = require('./fn')

/**
 *
 * @param {*} idB ИД Склада
 * @param {*} data Глобальные данные
 * @returns {object[]} Массив пуш-сообщений
 */
function push(idB, data) {
	// Если все секции выключены и склад тоже выключен, то не отправляем ни каких сообщений
	if (check(idB, data)) return

	// Обнаружена авария питания
	const r = fnBattery(idB, data)
	// console.log(5500, 'r', r)
	if (r) return r

	// Формирование актуального списка пушей
	return find(idB, data)
}

module.exports = push

/**
 * Cклад выключен и все секции не в авто
 * @param {*} idB ИД Склада
 * @param {*} data Глобальные данные
 * @returns {boolean} true - склад выключен и все секции не в авто
 */
function check(idB, data) {
	const modeS = isAS(idB, data)
	const start = data?.retain?.[idB]?.start
	return !modeS && !start
}
