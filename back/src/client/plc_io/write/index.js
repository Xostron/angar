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
	if (!out) return console.log('🟡output [plc_io]: Нет данных для записи')

	// Наличие изменений -> данные на запись
	const dataWrite = isChange(out)
	// console.log(11, out)
	// console.log(22, dataWrite)
	if (!dataWrite) return console.log('🟡output [plc_io]: Нет изменений для записи')

	// Запрос back->plc_io (reset)
	const services = await getServices()

	// По микросервисам
	for (const srv of services) {
		try {
			const api = fnApi(srv.url)

			const r = await api(apiConfig({ list: flt(dataWrite, srv), max: srv?.max ?? 1 }))

			// Ошибка запроса
			if (!r.data) throw new Error('Нет связи с сервисом')

			// Ответ от микросервиса:
			// Обновленные показания датчиков
			store.v = { ...store.v, ...r.data.v }
			console.log(`🟢output [plc_io]: ${srv.url}. Запрос успешно обработан`)

			// Пинг
			live(srv._id)
		} catch (error) {
			if (error.code === 'ECONNREFUSED' || !error.response)
				console.error(`🔴output [plc_io]: ${srv.url}. ECONNREFUSED`)
			else console.error(`🔴output [plc_io]: ${srv.url}. Ошибка запроса:`, error.message)
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

/**
 * Фильтруем модули выходов для микросервиса
 * @param {*} arr Модули на запись
 * @param {*} srv Микросервис, к которому передаем модули на запись
 */
function flt(arr = [], srv) {
	const r = arr.filter((mdl) => mdl.buildingId.some((id) => srv.bldId.includes(id)))
	// console.log(3, srv.name, r)
	return r
}
