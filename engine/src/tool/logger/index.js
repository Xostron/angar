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

function create(levels, max) {
	const log = createLogger({ levels: customLevels, handleExceptions: false })
	log.setMaxListeners(max)
	for (const t of transports(levels)) log.add(t)
	return log
}

// Диспетчер для периферийных устройств
const logger = create(peripheryLevels, peripheryLevels.length * 2 + 2)
// Диспетчер для сообщений: аварийные, информационные, действия пользователей
const loggerEvent = create(eventLevels, eventLevels.length * 2 + 2)
// Диспетчер логов показаний датчиков
const loggerSens = create(sensLevels, 20)
// Диспетчер логов электросчетчика
const loggerWatt = create(wattLevels, 20)

module.exports = { logger, loggerSens, loggerWatt, loggerEvent }
