const fsp = require('fs').promises;
const { readTO } = require('@tool/json');
const { dataDir } = require('@store');
const equip = require('./equip');
const { version } = require('@root/../package.json');

/**
 * Чтение файлов json (конфигурация) и формирование рамы для web
 * @returns Promise
 */
function equipment() {
	return new Promise((resolve, reject) => {
		fsp.readdir(dataDir)
			.then(readTO)
			.then(equip)
			.then((r) => {
				// Добавление информации о сервере
				r.apiInfo = {
					version: version,
					apiUri: process.env.API_URI,
					ip: process.env.IP,
					port: process.env.PORT,
					period: process.env.PERIOD,
					periodState: process.env.PERIOD_STATE,
				};
				resolve(r);
			})
			.catch(reject);
	});
}

module.exports = equipment;
