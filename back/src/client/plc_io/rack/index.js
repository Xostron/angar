const fnApi = require('@tool/api_plc_io')
const { delay, delayR } = require('@tool/command/time')
const readJson = require('@tool/json').read
const { readOne } = require('@tool/json')
const { data: store, accDir, live } = require('@store/index')
const { isExtralrm } = require('@tool/message/extralrm')

const apiConfig = (data, params = {}) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'back/rack',
	headers: { 'Content-Type': 'application/json' },
	data,
	params,
})

// Периодически отправляем раму
async function loopRack() {
	const uri = process.env?.API_URI_PLCIO ?? 'http://192.168.21.41:4001/api/'
	while (true) {
		rackIO(uri)
		// Повторно отправляем раму каждые 5 мин
		await delay(5 * 60 * 1000)
	}
}

/**
 * Отправка рамы на микросервис/ы plc_io
 *
 * @param {object[]} out Массив модулей (module+equipment+value) на запись
 * @returns
 */
async function rackIO(uri) {
	try {
		// Если нет адреса
		if (!uri) return console.log('🟡 back -> plc_io (rack): Нет адреса микросервиса plc_io')

		// Запрос back->plc_io
		const api = fnApi(uri)
		const data = await fnData()
		const r = await api(apiConfig(data))

		// Ошибка запроса
		if (!r.data) throw new Error('🔴 back -> plc_io (rack): Ошибка запроса')

		console.log('🟢 back -> plc_io (rack): Рама успешно отправлена')

		// Пинг
		live()
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || !error.response)
			console.error('🔴 back->plc_io (rack). ECONNREFUSED')
		else console.error('🔴 back->plc_io (rack). Ошибка запроса:', error.message)
	}
}

// Ответ микросервису rw: рама модулей и оборудования
async function fnData() {
	// Читаем раму
	const [module, equipment] = await readJson(['module', 'equipment'])
	// Время жизни опроса модулей 1 час
	module.forEach((el) => (el.expired = new Date(new Date().getTime() + 3600 * 1000)))
	// Получить аварии из аккумулятора из файла
	const acc = await readOne('acc.json', accDir)
	const alarm = !Object.keys(store.alarm.module).length ? (acc?.module ?? {}) : store.alarm.module
	return { module, equipment, alarm }
}

module.exports = loopRack
