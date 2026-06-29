const { fnThreadPool } = require('@worker')
const { store } = require('@store/index')
const write = require('@tool/plc/write')
const { delay } = require('@tool/time')
const getOutput = require('@tool/module/get_output')

/**
 * Запрос значений модулей
 *
 * @param {*} request Объект запроса, который содержит все данные о запросе
 * @param {*} reply Объект ответа, с помощью которого можно отправить ответ клиенту
 * @returns { timestamp: new Date(), v: {}, alarm:{} }
 * timestamp - время пинга
 * v - актуальные значения модулей
 * alarm - Аварийные сообщения модулей
 *
 */
async function output(request, reply) {
	// Данные на запись от ангара
	const { list, max } = request.body
	store.max = max
	console.log(111, store.max, typeof store.max)
	// Проверка - нет данных
	if (check(list)) {
		// Пинг
		store.live()
		console.log('🟡 output. Нет данных')
		return { timestamp: new Date() }
	}

	// Запись модулей выхода
	await write(list)
	// Задержка 100мс для вступления изменений в силу
	await delay(100)
	// Опрос модулей - получаем актуальные данные
	// store.v = store.max ? await fnThreadPool(store.max) : {}
	store.v = await fnThreadPool(store.max)
	// console.log(567, store.v)
	// Пинг
	store.live()
	// Отвечаем ангару актуальными значениями модулей
	console.log('🟢 output. Модули выходов успешно записаны') //JSON.stringify(store.v))
	return { timestamp: new Date(), v: store.v, alarm: store?.alarm?.module ?? {} }
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
	if (!!r.length) console.log('🟡 Запись выходов заблокирована по причине:', r)
	return !!r.length
}
