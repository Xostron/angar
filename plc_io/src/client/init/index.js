const api = require('@tool/api')
const { delay } = require('@tool/time')
const { store } = require('@store')

/**
 * Запрос рамы модулей и оборудования
 * Обновление каждые 7 мин
 */
async function loopInit() {
	while (true) {
		init()
		// обновление конфигурации склада каждые 7 минут
		await delay(store._period ?? 420001)
	}
}

module.exports = loopInit

async function init() {
	const config = {
		method: 'GET',
		url: 'io/init',
		headers: {},
	}

	const r = await api(config)
	if (!r?.data || !r?.data?.module || !r?.data?.equipment) return

	// Флаг рама обновлена
	store._update = true
	store.module = r.data.module
	store.equipment = r.data.equipment
	console.log('\x1b[32m%s\x1b[0m', 'Рама модулей и оборудования получена от ангара')
	return true
}
