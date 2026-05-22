const { fnThreadPool } = require('@worker')
const { store } = require('@store/index')
const write = require('@tool/plc/write')
const { delay } = require('@tool/time')

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

	// Данные на запись от ангара
	const out = request.body
	console.log(
		11,
		'Данные на запись',
		JSON.stringify(out.map((el) => ({ id: el._id, value: el.value }))),
	)
	if (check(out)) return { timestamp: new Date() }

	// Запись модулей выхода
	await write(out)
	await delay(100)
	// Чтение модулей
	store.v = await fnThreadPool(store.count)
	// Отвечаем ангару актуальными значениями модулей
	console.log('\x1b[32m%s\x1b[0m', 'Модули выходов успешно записаны', JSON.stringify(store.v))
	return { timestamp: new Date(), v: store.v }
}

module.exports = output

/**
 * Разрешение на запись модулей
 * @param {object[]} out Данные на запись от ангара
 * @returns {boolean} true - запрет записи
 */
function check(out) {
	const reason = [[!out?.length, 'Нет данных для записи']]
	const r = reason.filter(([v, mes]) => v)
	if (!!r.length) console.log('Запись выходов заблокирована по причине:', r)
	return !!r.length
}
