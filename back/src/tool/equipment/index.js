const fsp = require('fs').promises
const { readTO } = require('@tool/json')
const { dataDir } = require('@store')
const equip = require('./equip')

/**
 * Чтение файлов json (конфигурация) и формирование рамы для web
 * @returns Promise
 */
function equipment() {
	return new Promise((resolve, reject) => {
		fsp.readdir(dataDir).then(readTO).then(equip).then(resolve).catch(reject)
	})
}

module.exports = equipment
