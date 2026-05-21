const { store } = require('@store/index')

/**
 * Запрос статуса модулей
 * Модули исправны - {  timestamp: new Date(), alarmMdl: {} }
 * Модули неисправны - {  timestamp: new Date(), alarmMdl: {...аварии модулей} }
 *
 * @param {*} request Объект запроса, который содержит все данные о запросе
 * @param {*} reply Объект ответа, с помощью которого можно отправить ответ клиенту
 * @returns { timestamp: new Date(), alarmMdl: {} }
 * alarmMdl - аварийные сообщения
 *
 */
async function status(request, reply) {
	// Запрос от ангара пришел, обновляем флаг связи
	console.log(11, store.timestamp)
	store.live()
	// Отвечаем ангару
	return { timestamp: new Date(), alarmMdl: {} }
}

module.exports = status
