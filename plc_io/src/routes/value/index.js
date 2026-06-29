const { store } = require('@store/index')

/**
 * Запрос значений модулей
 *
 * @param {*} request Объект запроса, который содержит все данные о запросе
 * @param {*} reply Объект ответа, с помощью которого можно отправить ответ клиенту
 * @returns { timestamp: new Date(), v: {} }
 * alarmMdl - аварийные сообщения
 *
 */
async function value(request, reply) {
	const { max } = request.query
	store.max = +max
	// Запрос от ангара пришел, обновляем флаг связи
	store.live()
	console.log('🟢 value. Значения опроса модулей')
	// Отвечаем ангару
	return { timestamp: new Date(), v: store.v, alarm: store.alarm.module }
}

module.exports = value
