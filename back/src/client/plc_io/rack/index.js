const fnApi = require('@tool/api_plc_io')
const { delay } = require('@tool/command/time')
const readJson = require('@tool/json').read
const { readOne } = require('@tool/json')
const { data: store, accDir, live } = require('@store/index')
const { isExtralrm } = require('@tool/message/extralrm')
const { collectMdls } = require('@root/control/output/fn')
const { getServices, getMdlSrv } = require('@tool/api_plc_io/fn')
const _INTERVAL = 5 * 60 * 1000

const apiConfig = (data, params = {}) => ({
	method: 'POST',
	maxBodyLength: Infinity,
	url: 'back/rack',
	headers: { 'Content-Type': 'application/json' },
	data,
	params,
})

// Периодически отправляем раму (модули) микросервисам plcio
async function loopRack() {
	while (true) {
		// Рама микросервисов опроса модулей
		const services = await getServices()
		const module = await readOne('module.json')

		// Разрешение отправки рамы
		const reason = []
		if (!services?.length) reason.push('микросервисы')
		if (!module?.length) reason.push('модули')

		if (reason.length) {
			console.log(
				`🟡 back -> plc_io (rack): Режим микросервиса активен, но не найдены ${reason.join(', ')}`,
			)
			await delay(_INTERVAL)
			continue
		}

		// Фоном отправляем раму микросервисам
		services.forEach(rack)
		// ждем 5 минут
		await delay(_INTERVAL)
	}
}

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

		console.log(`🟢 back -> plc_io (rack ${srv.url}): Рама успешно отправлена`)

		// Пинг
		live(srv._id)
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || !error.response)
			console.error(`🔴 back->plc_io (rack ${srv.url}). ECONNREFUSED`)
		else console.error(`🔴 back->plc_io (rack ${srv.url})`, error.message)
	}
}

// Ответ микросервису rw: рама модулей (уникальные) и оборудования
async function fnData(srv) {
	// Читаем раму
	const [module, equipment, building] = await readJson(['module', 'equipment', 'building'])
	// Получить аварии из аккумулятора из файла
	const acc = await readOne('acc.json', accDir)

	// Список модулей для данного микросервиса
	const mdls = getMdlSrv(module, srv.list)

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

module.exports = loopRack
