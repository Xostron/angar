const { fnThreadPool } = require('@worker')
const { store } = require('@store/index')
const write = require('@tool/plc/write')

/**
 * Запрос значений модулей
 *
 * @param {*} request Объект запроса, который содержит все данные о запросе
 * @param {*} reply Объект ответа, с помощью которого можно отправить ответ клиенту
 * @returns { timestamp: new Date(), v: {} }
 * alarmMdl - аварийные сообщения
 *
 */
async function output(request, reply) {
	// Запрос от ангара пришел, обновляем флаг связи
	store.live()

	// Даные на запись от ангара
	const out = request.body
	console.log(11, 'Данные на запись', out)
	if (!out?.length) {
		console.log('Запись выходов: пустые данные от ангара')
		return { timestamp: new Date() }
	}

	// Запись модулей выхода
	await write(out)
	// Чтение модулей
	store.v = await fnThreadPool(store.count)
	// Отвечаем ангару актуальными значениями модулей
	console.log(22, JSON.stringify(store.v))
	return { timestamp: new Date(), v: store.v }
}

module.exports = output
