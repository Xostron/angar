const { createLogger } = require('winston')
const { customLevels, hourlyT } = require('./config')
const { mongoT } = require('./db_transport')

const peripheryLevels = ['fan', 'valve', 'heating', 'cooler', 'aggregate', 'device', 'voltage']
const eventLevels = ['alarm', 'event', 'activity']
const sensLevels = ['sensor']
const wattLevels = ['watt']

// Собрать транспорты: файл + MongoDB (если доступна)
function transports(levels) {
	const arr = levels.map((l) => hourlyT(l))
	for (const l of levels) {
		const mt = mongoT(l)
		if (mt) arr.push(mt)
	}
	return arr
}

// Диспетчер для периферийных устройств
const logger = createLogger({
	levels: customLevels,
	handleExceptions: false,
	transports: transports(peripheryLevels),
})
logger.setMaxListeners(peripheryLevels.length * 2 + 2)

// Диспетчер для сообщений: аварийные, информационные, действия пользователей
const loggerEvent = createLogger({
	levels: customLevels,
	handleExceptions: false,
	transports: transports(eventLevels),
})
loggerEvent.setMaxListeners(eventLevels.length * 2 + 2)

// Диспетчер логов показаний датчиков
const loggerSens = createLogger({
	levels: customLevels,
	handleExceptions: false,
	transports: transports(sensLevels),
})

// Диспетчер логов электросчетчика
const loggerWatt = createLogger({
	levels: customLevels,
	handleExceptions: false,
	transports: transports(wattLevels),
})

module.exports = { logger, loggerSens, loggerWatt, loggerEvent }
