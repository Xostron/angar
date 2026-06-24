const fnApi = require('@tool/api_plc_io')
const { data: store, live } = require('@store')
const { getServices } = require('@tool/api_plc_io/fn')

const apiConfig = (data, params = {}) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'back/output',
	headers: { 'Content-Type': 'application/json' },
	data,
	params,
})

/**
 * Отправка данных на запись модулей + обновление опроса модулей
 * @param {object[]} out Массив модулей (module+equipment+value) на запись
 * @returns
 */
async function writeIO(out) {
	if (!out) return console.log('🟡 back->plc_io (output).', 'Нет данных для записи')

	// Наличие изменений
	const o = isChange(out)
	if (!o) return console.log('🟡 back->plc_io (output).', 'Нет изменений для записи')

	// Запрос back->plc_io (reset)
	const services = await getServices()

	// По микросервисам
	for (const srv of services) {
		try {
			const api = fnApi(srv.url)
			const r = await api(apiConfig(o))

			// Ошибка запроса
			if (!r.data) throw new Error('Нет связи с сервисом')

			// Ответ от микросервиса:
			// Обновленные показания датчиков
			store.v = { ...store.v, ...r.data.v }

			console.log(`🟢 back->plc_io (output ${srv.url}). Запрос успешно обработан`)

			// Пинг
			live(srv.id)
		} catch (error) {
			if (error.code === 'ECONNREFUSED' || !error.response)
				console.error(`🔴 back->plc_io (output ${srv.url}). ECONNREFUSED`)
			else
				console.error(`🔴 back->plc_io (output ${srv.url}). Ошибка запроса:`, error.message)
		}
	}

	return true
}

module.exports = writeIO

/**
 * Наличие изменений
 * Сравнение текущего состояния выходов === с состоянием выходов после алгоритма
 *
 * @param {object[]} out массив модулей на запись для PLC_IO
 * @returns {object[] | boolean} 	object[] - массив модулей на запись для PLC_IO (отфильтрованные)
 * 									false - изменений нет, блокируем отправку на PLC_IO
 */
function isChange(out) {
	const o = out.filter((el) => {
		if (
			JSON.stringify(el.value) !==
			JSON.stringify(store.v?.[el._id[0]]?.output ?? store.v?.[el._id[0]])
		)
			return true
	})
	return o.length ? o : false
}
