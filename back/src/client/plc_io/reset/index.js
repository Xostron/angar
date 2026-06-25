const fnApi = require('@tool/api_plc_io')
const { data: store, live } = require('@store')
const { reset } = require('@tool/reset')
const { getServices, mergeAlr } = require('@tool/api_plc_io/fn')

const apiConfig = (data, params = {}) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'back/reset',
	headers: { 'Content-Type': 'application/json' },
	data,
	params,
})

/**
 * Отправляем команду "Сброс аварии" на микросервисы
 * @returns
 */
async function resetIO() {
	// Если нет сигнала сброса, то ничего не отправляем
	if (!store.reset?.size) return

	// Флаг успешно ли сбросился хотя бы один сервис
	let hasSuccess = false

	// Запрос back->plc_io (reset)
	const services = await getServices()

	// Отправляем команду "Сброс аварии" на микросервисы
	// По микросервисам
	for (const srv of services) {
		try {
			const api = fnApi(srv.url)
			const r = await api(apiConfig({}))

			// Ошибка запроса
			if (!r.data) throw new Error('Нет связи с сервисом')

			hasSuccess = true
			// Ответ от микросервиса:
			// Обновленные показания датчиков
			store.v = { ...store.v, ...r.data.v }
			// Обновление списка аварий
			await mergeAlr(store.alarm.module, r.data.alarm, srv.list)

			console.log('🟢 back -> plc_io (reset): Запрос успешно обработан')

			// Пинг
			live(srv._id)
		} catch (error) {
			if (error.code === 'ECONNREFUSED' || !error.response)
				console.error(`🔴 back->plc_io (reset ${srv.url}). ECONNREFUSED`)
			else console.error(`🔴 back->plc_io (reset ${srv.url}).`, error.message)
		}
	}

	// Сброс флага в логике ангара
	if (hasSuccess) reset(null, false, false)

	return true
}

module.exports = resetIO
