const { store } = require('@store/index')

/**
 * Прием рамы (module,equipment) и аварийных сообщений от серверов ангаров
 *
 * @param {*} request Объект запроса, который содержит все данные о запросе
 * @param {*} reply Объект ответа, с помощью которого можно отправить ответ клиенту
 * @returns { timestamp: new Date() }
 */
async function rack(request, reply) {
	const { idsB = [], module = [], alarm = {}, max = 1 } = request?.body
	// Кол-во потоков
	store.max = max 
	// Встраивание полученных модулей от PC в общий массив модулей store.module
	collect(idsB, module)

	// Прием аварийных сообщений
	store.alarm.module = { ...store.alarm.module, ...alarm }

	// Флаг рама получена
	store._handshake = true

	// Пинг
	store.live()

	// Отвечаем ангару
	console.log('🟢 rack. Рама получена')
	return { timestamp: new Date() }
}

module.exports = rack

/**
 * Встраивание полученных модулей от PC в общий массив модулей store.module
 * @param {object[]} module Рама уникальных модулей (module+equipment) от ангара
 */
function collect(idsB, module) {
	// Если
	if (!module?.length) return store.module

	// Выделяем из общего числа модулей, модули которые не принадлежат данным складам
	const mdlsB = store.module.filter((el) => el.buildingId.some((idB) => !idsB.includes(idB)))

	// Складываем новые модули module + оставшиеся mdlsB
	store.module = [...mdlsB, ...module]
}
