const api = require('@tool/api')
const { delay } = require('@tool/time')
const { store } = require('@store/index')

/**
 * Запрос рамы модулей и оборудования
 * Обновление каждые 7 мин
 */
async function loopRack() {
	while (true) {
		getRack()
		// обновление конфигурации склада каждые 7 минут
		await delay(store._period ?? 420001)
	}
}

async function getRack(type) {
	const config = {
		method: 'GET',
		url: 'io/init',
		headers: {},
	}

	// Режим init: срабатывает всегда пока флаг store.handshake =false
	if (type === 'init' && store._handshake)
		return console.log('\x1b[32m%s\x1b[0m', 'Рама получена')

	const r = await api(config)
	if (!r?.data || !r?.data?.module || !r?.data?.equipment)
		return console.log(
			'\x1b[32m%s\x1b[0m',
			'plc_io -> back: Инициализация рамы не пройдена (нет связи с ангаром)',
		)

	store.live()

	store.module = r.data.module
	store.equipment = r.data.equipment
	store.alarm.module = r.data.alarm ?? {}

	store._handshake = true
	console.log('\x1b[32m%s\x1b[0m', 'Рама модулей и оборудования получена от ангара')
	return true
}

module.exports = { loopRack, getRack }
