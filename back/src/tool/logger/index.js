const { createLogger } = require('winston');
const { customLevels, hourlyT } = require('./config');

const logger = createLogger({
	levels: customLevels,
	// Ставим 'silly', чтобы при желании логировать всё подряд
	// level: 'silly',
	transports: [
		hourlyT('error'),
		// hourlyT('warn'),
		// hourlyT('info'),
		// hourlyT('http'),
		// hourlyT('verbose'),
		// hourlyT('debug'),
		// hourlyT('silly'),

		hourlyT('fan'),
		hourlyT('valve'),
		hourlyT('heating'),
		hourlyT('cooler'),
		// hourlyT('solenoid'),
		hourlyT('aggregate'),
		// hourlyT('compressor'),
		// hourlyT('condenser'),
		hourlyT('device'),
		hourlyT('sensor'),
		// hourlyT('building'),
		// hourlyT('user'),
		hourlyT('alarm'),
	],
});

module.exports = logger;
