const { delay } = require('@tool/command/time')
const { readOne } = require('@tool/json')
const { getServices } = require('@tool/api_plc_io/fn')
const rack = require('./fn')
const _INTERVAL = 5 * 60 * 1000

// Периодически отправляем раму (модули) микросервисам plcio
async function loopRack() {
	while (true) {
		if (!store.isIo) {
			await delay(_INTERVAL)
			continue
		}
		// Рама микросервисов опроса модулей
		const services = await getServices()
		const module = await readOne('module.json')
		// Разрешение отправки рамы
		const reason = []
		if (!services?.length) reason.push('микросервисы')
		if (!module?.length) reason.push('модули')

		if (reason.length) {
			console.log(`🟡rack [plc_io]: Микросервис активен, но не найдены ${reason.join(', ')}`)
			await delay(_INTERVAL)
			continue
		}

		// Отправляем раму микросервисам
		for (const srv of services) await rack(srv)

		// ждем 5 минут
		await delay(_INTERVAL)
	}
}

module.exports = loopRack
