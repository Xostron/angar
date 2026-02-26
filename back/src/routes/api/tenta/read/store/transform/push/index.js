const { getSectAM } = require('@tool/get/building')
const { fnBattery, find } = require('./fn')

/**
 *
 * @param {*} idB ИД Склада
 * @param {*} obj Глобальные данные
 * @returns {object[]} Массив пуш-сообщений
 */
function push(idB, section, obj) {
	// Если все секции выключены и склад тоже выключен, то не отправляем ни каких сообщений
	if (check(idB, section, obj)) return

	// Обнаружена авария питания
	const r = fnBattery(idB, obj)
	// console.log(5500, 'r', r)
	if (r) return r

	// Формирование актуального списка пушей
	return find(idB, obj)
}

module.exports = push

/**
 * Cекции выключены
 * @param {*} idB ИД Склада
 * @param {*} obj Глобальные данные
 * @returns {boolean} true - запрет отправки уведомлений
 */
function check(idB, section, obj) {
	const sectAM = getSectAM(idB, section, obj)
	const start = obj?.retain?.[idB]?.start
	console.log(9991, sectAM, 'Блокировка пуш', !sectAM?.length)
	return !sectAM?.length
}
