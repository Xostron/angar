const { data: store } = require('@store')
const clearAlarm = require('./fn')

/**
 * 1. Флаг установить "сброс аварий" (нажатие кнопки в mobile|web app)
 * 2. Сбросить флаг (back\src\control\extra\extra\def\reset)
 * 3. Очистка аварийных сообщений и аккумуляторов store.acc.extralarm
 * @param {string} idB Ид склада
 * @param {boolean} exclude Исключение: true - не очищать аварийные сообщения,
 * false - по-умолчанию очищать
 * @param {boolean} type true - установить флаг сброса аварии, false - сбросить флаг
 * @returns
 */
function reset(idB, exclude = false, type = true) {
	// Сбросить флаг
	if (!type) return store.reset.clear()
	// Установить флаг
	store.reset.add(idB)
	// Очистка аварий
	clearAlarm(exclude)
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
