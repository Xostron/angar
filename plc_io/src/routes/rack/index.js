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
async function rack(request, reply) {
	// Запрос от ангара пришел, обновляем флаг связи
	store.live()
	store.module = request.body?.module ?? []
	store.equipment = request.body?.equipment ?? {}
	store.alarm.module = request.body?.alarm ?? {}

	store._handshake = true
	console.log('🟢 rack. Рама получена')
	// Отвечаем ангару
	return { timestamp: new Date(), v: store.v, alarm: store.alarm.module }
}

module.exports = rack
