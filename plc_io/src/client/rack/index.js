const api = require('@tool/api')
const { delay } = require('@tool/time')
const { store } = require('@store/index')

/**
 * Запрос рамы модулей и оборудования
 * Обновление каждые 7 мин по-умолчанию | Если нет рамы, то каждые 10 сек
 */
async function loopRack() {
	while (true) {
		// Запрос рамы module, аварийных сообщений alarm
		await getRack()

		// [Обновление каждые 7 мин по-умолчанию] : [Если нет рамы, то каждые 10 сек]
		store._handshake ? await delay(store._period ?? 420001) : await delay(10000)
	}
}

async function getRack() {
	const config = {
		method: 'GET',
		url: 'io/init',
		headers: {},
	}

	const r = await api(config)
	// Нет связи с сервером ангара
	if (!r?.data || !r?.data?.module || !r?.data?.equipment)
		return console.log('🔴 plc_io -> back. Невозможно получить раму - нет связи с ангаром')

	// Есть связь
	store.live()

	store.module = r.data.module
	store.equipment = r.data.equipment
	store.alarm.module = r.data.alarm ?? {}

	store._handshake = true
	console.log('🟢 Рама от ангара получена')
	return true
}

module.exports = { loopRack }
