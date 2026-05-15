const { delay } = require('../time')
const store = require('@store')

/**
 * Запрос рамы модулей и оборудования
 * Обновление каждые 7 мин
 */
async function loopInit() {
	while (true) {
		await init()
		store._update = true
		// обновление конфигурации склада каждые 7 минут
		await delay(process.env?.PERIOD ?? 420001)
	}
}

module.exports = loopInit

async function init() {
	// TODO: Пропуск инициализации на локальном хосте
	if (['127.0.0.1', 'localhost'].includes(process.env.IP_ANGAR)) {
		console.log(
			'\x1b[32m%s\x1b[0m',
			`IP ангара ${process.env.IP_ANGAR} не является публичным, пропуск инициализации`,
		)
		return
	}
	const config = {
		method: 'GET',
		url: 'rw/init',
		headers: {},
	}

	const r = await api(config)
	console.log(r)
}
