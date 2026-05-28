const { store } = require('@store/index')

/**
 * Запрос статуса модулей
 * Модули исправны - {  timestamp: new Date(), alarmMdl: {} }
 * Модули неисправны - {  timestamp: new Date(), alarmMdl: {...аварии модулей} }
 *
 * @param {*} request Объект запроса, который содержит все данные о запросе
 * @param {*} reply Объект ответа, с помощью которого можно отправить ответ клиенту
 * @returns { timestamp: new Date(), alarm: {} }
 * alarmMdl - аварийные сообщения
 *
 */
async function reset(request, reply) {
	// Сброс аварии и аккумулятора антидребезга модулей
	console.log(33, reset)
	store.alarm.module = {}
	store.debMdl = {}
	store.timeout = {}

	// Обновление флага связи
	store.live()

	// Отвечаем ангару
	return { timestamp: new Date(), alarm: store?.alarm?.module ?? {} }
}

module.exports = reset
