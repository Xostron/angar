const fnApi = require('@tool/api_plc_io')
const { data: store, live } = require('@store')
const { reset } = require('@tool/reset')

const apiConfig = (data, params = {}) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'back/reset',
	headers: { 'Content-Type': 'application/json' },
	data,
	params,
})

/**
 * Отправка данных на запись модулей + обновление опроса модулей
 * @param {object[]} out Массив модулей (module+equipment+value) на запись
 * @returns
 */
async function resetIO() {
	try {
		// Если нет сигнала сброса, то ничего не отправляем
		if (!store.reset?.size) return

		// Запрос back->plc_io (reset)
		const uri = process.env?.API_URI_PLCIO ?? 'http://192.168.21.41:4001/api/'
		const api = fnApi(uri)
		const r = await api(apiConfig({}))

		// Ошибка запроса
		if (!r.data) throw new Error('🔴 back -> plc_io (reset): Ошибка запроса')
		reset(null, false, false)
		console.log('🟢 back -> plc_io (reset): Запрос успешно обработан')

		// Обновление опроса модулей
		store.v = r.data.v
		// Обновление списка аварий
		store.alarm.module = r.data.alarm
		// Пинг
		live()
		return true
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || !error.response)
			console.error('🔴 back->plc_io (reset). ECONNREFUSED')
		else console.error('🔴 back->plc_io (reset). Ошибка запроса:', error.message)
	}
}

module.exports = resetIO
