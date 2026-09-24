const { delay } = require('@tool/command/time')
const { init } = require('@tool/init')

// Запрос рамы у админки (Только при старте, с рандомной задержкой от 0 до 30сек)
async function loopInit() {
	// while (true) {
	const randomNumber = Math.floor(Math.random() * 30001)
	console.log(123, randomNumber)
	await delay(randomNumber)
	// await delay(process.env?.PERIOD ?? 420001)
	init()
	//  7 минут
	// }
}

module.exports = loopInit
