const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../../.env') })
const { retainDir, factoryDir, dataDir } = require('@store')
const api = require('@tool/api')
const { writeSync } = require('@tool/json')
const equipment = require('@tool/equipment')
const { cEquip } = require('@socket/emit')
const transformF = require('./fn')

// Запрос конфигурации у админ-сервера и сохранение в json
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
			// сохранение конфигурации в json
			writeSync(r.data.result, dataDir, t)
			// Сохранение значений "marklist-def" из рамы заводских настроек
			transformF(r?.data?.result?.factory, factoryDir)
			// Формирование рамы для клиента
			return equipment()
		})
		// отправка рамы на клиент
		.then((data) => cEquip(data))
		.catch(console.log)
		// обновление конфигурации склада каждые 7 минут
		.finally((_) => {
			setTimeout(() => init(), process.env?.PERIOD ?? 420001)
		})
}

module.exports = init

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
	'weather'
];
