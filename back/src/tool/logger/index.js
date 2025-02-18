const { createLogger } = require('winston')
const { customLevels, hourlyT } = require('./config')

const logger = createLogger({
	levels: customLevels,
	// handleExceptions: false,
	// Ставим 'silly', чтобы при желании логировать всё подряд
	// level: 'silly',
	transports: [
		// hourlyT('error'),
		// hourlyT('warn'),
		// hourlyT('info'),
		// hourlyT('http'),
		// hourlyT('verbose'),
		// hourlyT('debug'),
		// hourlyT('silly'),

		// hourlyT('solenoid'),
		// hourlyT('compressor'),
		// hourlyT('condenser'),
		hourlyT('fan'),
		hourlyT('valve'),
		hourlyT('heating'),
		hourlyT('cooler'),
		hourlyT('aggregate'),
		hourlyT('device'),
	],
})

const loggerEvent = createLogger({
	levels: customLevels,
	handleExceptions: false,
	// Ставим 'silly', чтобы при желании логировать всё подряд
	// level: 'silly',
	transports: [hourlyT('alarm'), hourlyT('event'), hourlyT('activity')],
})

const loggerSens = createLogger({
	levels: customLevels,
	// handleExceptions: false,
	transports: [hourlyT('sensor')],
})

const loggerWatt = createLogger({
	levels: customLevels,
	// handleExceptions: false,
	// Ставим 'silly', чтобы при желании логировать всё подряд
	// level: 'silly',
	transports: [hourlyT('watt')],
})

module.exports = { logger, loggerSens, loggerWatt, loggerEvent }

/**
 * Вышло предупреждение превышение в логе кол-во регистраторов
 * MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
 * 11 end listeners added to [DerivedLogger]. MaxListeners is 10.
 * Use emitter.setMaxListeners() to increase limit
 * Разбил на несколько логеров, предупреждение исчезло
 */
