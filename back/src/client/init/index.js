const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../../.env') })
const { factoryDir, dataDir } = require('@store')
const { delay } = require('@tool/command/time')
const equipment = require('@tool/equipment')
const { writeSync } = require('@tool/json')
const { cEquip } = require('@socket/emit')
const transformF = require('./fn')
const api = require('@tool/api')

/**
 * Запрос конфигурации склада у админ-сервера
 * Сохранение в json
 * Формирование и отправка конфигурации (рамы) на web
 * Периодическое выполнение каждые 7 мин
 */
function init() {
	const config = {
		method: 'GET',
		url: 'angar/init',
		headers: { ip: process.env.IP },
	}
	api(config)
		.then((r) => {
			if (!r?.data?.result) {
				console.log('\x1b[32m%s\x1b[0m', `AdminServer ${process.env.API_URI} не отвечает`)
				return
			}
			console.log('\x1b[32m%s\x1b[0m', `Данные с AdminServer ${process.env.API_URI} получены`)
			// Сохранение конфигурации в json
			writeSync(r.data.result, dataDir, t)
			// Заводские настройки в json
			transformF(r?.data?.result?.factory, factoryDir)
			// Формирование рамы для клиента
			return equipment()
		})
		// отправка рамы на клиент
		.then((data) => cEquip(data))
		.catch(console.log)
}

async function loopInit() {
	while (true) {
		init()
		// обновление конфигурации склада каждые 7 минут
		await delay(process.env?.PERIOD ?? 420001)
	}
}

module.exports = loopInit

const t = [
	'building',
	'equipment',
	'fan',
	'heating',
	'module',
	'pc',
	'product',
	'range',
	'section',
	'sensor',
	'signal',
	'valve',
	'factory',
	'aggregate',
	'device',
	'cooler',
	'binding',
	'weather',
]
