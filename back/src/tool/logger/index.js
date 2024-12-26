const { createLogger } = require('winston');
const { customLevels, hourlyT } = require('./config');

const logger = createLogger({
	levels: customLevels,
	// Ставим 'silly', чтобы при желании логировать всё подряд
	// level: 'silly',
	transports: [
		hourlyT('error'),
		hourlyT('warn'),
		hourlyT('info'),
		hourlyT('http'),
		hourlyT('verbose'),
		hourlyT('debug'),
		hourlyT('silly'),
	],
});

module.exports = logger;
