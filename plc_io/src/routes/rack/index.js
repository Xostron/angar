const { store } = require('@store/index')

/**
 * Прием рамы (module,equipment) и аварийных сообщений от серверов ангаров
 *
 * @param {*} request Объект запроса, который содержит все данные о запросе
 * @param {*} reply Объект ответа, с помощью которого можно отправить ответ клиенту
 * @returns { timestamp: new Date() }
 * alarmMdl - аварийные сообщения
 *
 */
async function rack(request, reply) {
	const { idsB = [], module = [], alarm = {} } = request?.body
	// Запрос от ангара пришел, обновляем флаг связи
	store.live()

	collect(idsB, module)

	store.alarm.module = request.body?.alarm ?? {}

	store._handshake = true
	console.log('🟢 rack. Рама получена')
	// Отвечаем ангару
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
	// console.log(111, idsB, module)
	// Выделяем из общего числа модулей, модули которые не принадлежат данным складам
	const mdlsB = store.module.filter((el) => el.buildingId.some((idB) => !idsB.includes(idB)))
	// console.log(222, mdlsB)
	// Складываем новые модули module + оставшиеся mdlsB
	store.module = [...mdlsB, ...module]
	// console.log(333, store.module)
}
