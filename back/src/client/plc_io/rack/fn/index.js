const fnApi = require('@tool/api_plc_io')
const readJson = require('@tool/json').read
const { readOne } = require('@tool/json')
const { data: store, accDir, live } = require('@store/index')
const { collectMdls } = require('@root/control/output/fn')
const { getMdlSrv } = require('@tool/api_plc_io/fn')

const apiConfig = (data, params = {}) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'back/rack',
	headers: { 'Content-Type': 'application/json' },
	data,
	params,
})

/**
 * Отправка рамы на микросервис plc_io
 *
 * @param {object} srv Рама микросервиса
 * @returns
 */
async function rack(srv) {
	try {
		// Тело запроса
		const data = await fnData(srv)
		// Запрос back->plc_io
		const api = fnApi(srv.url)
		const r = await api(apiConfig(data))

		// Ошибка запроса
		if (!r.data) throw new Error('Нет связи с сервисом')
		console.log(`🟢rack [plc_io]: ${srv.url}. Рама успешно отправлена`)

		// Пинг
		live(srv._id)
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || !error.response)
			console.error(`🔴 rack [plc_io]: ${srv.url}. ECONNREFUSED`)
		else console.error(`🔴 rack [plc_io]:k ${srv.url}`, error.message)
	}
}

// Ответ микросервису rw: рама модулей (уникальные) и оборудования
async function fnData(srv) {
	// Читаем раму
	const [module, equipment, building] = await readJson(['module', 'equipment', 'building'])
	// Получить аварии из аккумулятора из файла
	const acc = await readOne('acc.json', accDir)
	// Список модулей для данного микросервиса
	const mdls = getMdlSrv(module, srv)
	return {
		// Массив ИД складов
		idsB: building.map((el) => el._id),
		// Уникальные модули (один и тот же модуль может существовать в нескольких складах)
		module: collectMdls(mdls, equipment),
		// Неисправности модулей
		alarm: !Object.keys(store.alarm.module).length ? (acc?.module ?? {}) : store.alarm.module,
		// Количество потоков
		max: srv?.max ?? 1,
	}
}

module.exports = rack
