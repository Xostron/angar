const fsp = require('fs').promises;
const { readTO } = require('@tool/json');
const { dataDir } = require('@store');
const equip = require('./equip');
const getInfo = require('@tool/init/info');
/**
 * Чтение файлов json (конфигурация) и формирование рамы для web
 * @returns Promise
 */
function equipment() {
	return new Promise((resolve, reject) => {
		fsp.readdir(dataDir)
			.then(readTO)
			.then((_) => Promise.all([equip(_), getInfo()]))
			.then(([r, info = {}]) => {
				info.apiUri = process.env.API_URI;
				info.port = process.env.PORT;
				info.period = process.env.PERIOD;
				info.periodState = process.env.PERIOD_STATE;
				r.apiInfo = info;
				resolve(r);
			})
			.catch(reject);
	});
}

module.exports = equipment;
