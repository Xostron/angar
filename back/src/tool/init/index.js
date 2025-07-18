// // const path = require('path')
// // require('dotenv').config({ path: path.join(__dirname, '../../../../.env') })
const { factoryDir, dataDir } = require('@store')
const { writeSync } = require('@tool/json')
const { cEquip } = require('@socket/emit')
const equipment = require('@tool/equipment')
const transformF = require('./fn')
const api = require('@tool/api')
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

/**
 * Запрос конфигурации склада у админ-сервера
 * Сохранение в json
 * Формирование и отправка конфигурации (рамы) на web
 */
async function init() {
	const config = {
		method: 'GET',
		url: 'angar/init',
		headers: { ip: process.env.IP },
	}
	return (
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
	)
}

module.exports = init
