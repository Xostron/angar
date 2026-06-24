const fnApi = require('@tool/api_plc_io')
const { delay } = require('@tool/command/time')
const { data: store, live } = require('@store/index')
const { getServices, mergeAlr } = require('@tool/api_plc_io/fn')
const config = {
	method: 'GET',
	url: 'back/value',
	headers: { 'Content-Type': 'application/json' },
}
const _INTERVAL = 10 * 1000

// Периодический запрос у микросервиса значения модулей раз в 10 сек
async function loopValue() {
	while (true) {
		// Рама микросервисов опроса модулей
		const services = await getServices()

		services.forEach(valueIO)
		// Повторно отправляем раму каждые 10сек
		await delay(_INTERVAL)
	}
}

/**
 * Запрос значения модулей
 * @returns
 */
async function valueIO(srv) {
	try {
		// Запрос back->plc_io
		const api = fnApi(srv.url)
		const r = await api(config)

		// Ошибка запроса
		if (!r.data) throw new Error('Нет связи с сервисом')

		// Ответ от микросервиса:
		// Обновленные показания датчиков
		store.v = { ...store.v, ...r.data.v }
		// Обновление списка аварий
		await mergeAlr(store.alarm.module, r.data.alarm, srv.list)

		console.log(`🟢 back -> plc_io (value ${srv.url}): Значения успешно приняты`)

		// Пинг
		live(srv.id)
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || !error.response)
			console.error(`🔴 back->plc_io (value ${srv.url}). ECONNREFUSED`)
		else console.error(`🔴 back->plc_io (value ${srv.url}).`, error.message)
	}
}

module.exports = loopValue
