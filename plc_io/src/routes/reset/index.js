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
	// Очистка аккумулятора главного потока
	console.log(123, request.body)
	store.alarm.module = {}
	store.debMdl = {}
	
	// Взвод флага reset, для очистки в воркерах опроса модулей
	// в конце цикла этот флаг сбрасываем
	store.reset = true
	
	// Обновление флага связи
	store.live()
	
	console.log(55, '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@reset', store.reset)
	// Отвечаем ангару
	return { timestamp: new Date(), alarm: store?.alarm?.module ?? {} }
}

module.exports = reset
