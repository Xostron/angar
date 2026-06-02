const fnApi = require('@tool/api_plc_io')
const { delay } = require('@tool/command/time')
const { data: store, live } = require('@store/index')
const config = {
	method: 'GET',
	url: 'back/value',
	headers: { 'Content-Type': 'application/json' },
}

// Периодически значения модулей раз в 10 сек
async function loopValue() {
	const uri = process.env?.API_URI_PLCIO ?? 'http://192.168.21.41:4001/api/'
	while (true) {
		valueIO(uri)
		// Повторно отправляем раму каждые 10сек
		await delay(10000)
	}
}

/**
 * Запрос значения модулей
 * @returns
 */
async function valueIO(uri) {
	try {
		// Если нет адреса
		if (!uri) return console.log('🟡 back -> plc_io (value): Нет адреса микросервиса plc_io')

		// Запрос back->plc_io
		const api = fnApi(uri)
		const r = await api(config)

		// Ошибка запроса
		if (!r.data) throw new Error('🔴 back -> plc_io (value): Ошибка запроса')

		// Сохраняем данные
		if (Object.keys(r?.data?.v ?? {}).length) store.v = r?.data?.v
		store.alarm.module = r.data.alarm

		console.log('🟢 back -> plc_io (value): Значения успешно приняты')

		// Пинг
		live()
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || !error.response)
			console.error('🔴 back->plc_io (value). ECONNREFUSED')
		else console.error('🔴 back->plc_io (value). Ошибка запроса:', error.message)
	}
}

module.exports = loopValue
