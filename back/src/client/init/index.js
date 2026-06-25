const { delay } = require('@tool/command/time')
const { init } = require('@tool/init')

// Запрос рамы у админки, каждые 7 мин
async function loopInit() {
	while (true) {
		init()
		// 7 минут
		await delay(process.env?.PERIOD ?? 420001)
	}
}

module.exports = loopInit
