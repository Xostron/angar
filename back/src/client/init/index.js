const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../../.env') })
const { delay } = require('@tool/command/time')
const init = require('./fn')
console.log(5555, init)

// Периодическое выполнение каждые 7 мин
async function loopInit() {
	while (true) {
		init()
		// обновление конфигурации склада каждые 7 минут
		await delay(process.env?.PERIOD ?? 420001)
	}
}

module.exports = loopInit
