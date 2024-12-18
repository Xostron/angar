const { readTO } = require('@tool/json');
const fsp = require('fs').promises;
const { dataDir } = require('@store');
const equip = require('./equip');

// Формирование данных по всем складам и оборудованию
function equipment() {
	return new Promise((resolve, reject) => {
		fsp.readdir(dataDir)
			.then(readTO)
			.then(equip)
			.then(resolve)
			.catch(reject);
	});
}

module.exports = equipment;
