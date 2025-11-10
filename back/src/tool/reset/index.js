const { data: store } = require('@store')
const clearAlarm = require('./fn')

/**
 * 1. Флаг установить "сброс аварий" (нажите кнопки в mobile|web app)
 * 2. Сбросить флаг (back\src\control\extra\extra\def\reset)
 * 2. Очистка аварийных сообщений и аккумуляторов store.acc.extralarm
 * @param {string} idB Ид склада
 * @param {boolean} type
 * @returns
 */
function reset(idB, type = true) {
	// Сбросить флаг
	if (!type) return store.reset.clear()
	// Установить флаг
	store.reset.add(idB)
	// Очистка аварий
	clearAlarm()
}

/**
 * Проверка наличия флага сброса аварий
 * @param {string} idB ИД склада
 * @returns {boolean} true - флаг установлен
 */
function isReset(idB) {
	return store.reset.has(idB)
}

module.exports = { reset, isReset }
