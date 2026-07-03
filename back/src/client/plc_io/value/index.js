const fnApi = require('@tool/api_plc_io')
const { delay } = require('@tool/command/time')
const { data: store, live } = require('@store/index')
const { getServices, mergeAlr } = require('@tool/api_plc_io/fn')
const _INTERVAL = 10 * 1000
// const config = {
// 	method: 'GET',
// 	url: 'back/value',
// 	headers: { 'Content-Type': 'application/json' },
// }
const apiConfig = (params = {}) => ({
	method: 'GET',
	url: 'back/value',
	headers: { 'Content-Type': 'application/json' },
	params,
})

/**
 * Запрос значения модулей
 * @returns
 */
async function valueIO(srv) {
	try {
		// Запрос back->plc_io
		const api = fnApi(srv.url)
		// const r = await api(config)
		const r = await api(apiConfig({ max: srv?.max ?? 1 }))

		// Ошибка запроса
		if (!r.data) throw new Error('Нет связи с сервисом')

		// Ответ от микросервиса: обновленные показания датчиков
		store.v = { ...store.v, ...r.data.v }

		// Обновление списка аварий
		await mergeAlr(store.alarm.module, r.data.alarm, srv)

		console.log(`🟢value [plc_io]: ${srv.url}. Значения успешно приняты`)

		// Пинг
		live(srv._id)
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || !error.response)
			console.error(`🔴value [plc_io]: ${srv.url}. ECONNREFUSED`, error)
		else console.error(`🔴value [plc_io]: ${srv.url}.`, error.message)
	}
}

// Периодический запрос у микросервиса значения модулей раз в 10 сек
async function loopValue() {
	while (true) {
		if (!store.isIo) {
			await delay(_INTERVAL)
			continue
		}
		// Рама микросервисов опроса модулей
		const services = await getServices()

		// services.forEach(valueIO)
		for (const srv of services) await valueIO(srv)
		// Повторно отправляем раму каждые 10сек
		await delay(_INTERVAL)
	}
}

module.exports = loopValue
