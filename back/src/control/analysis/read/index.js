const readJson = require('@tool/json').read
const readTCP = require('@tool/control/read')
const { collectMdls } = require('../../output/fn')

// Опрос модулей
function readM(obj) {
	return new Promise((resolve, reject) => {
		// json-файлы: конфигурация модулей
		readJson(['module', 'equipment', 'building'])
			.then(([module, equipment, building]) => {
				if (!building || !building?.length) return {}
				// Уникальные модули
				const arr = collectMdls(module, equipment)
				// Опрос модулей по сети
				return readTCP(arr, obj)
			})
			.then((r) => {
				resolve(r)
			})
			.catch(reject)
	})
}

module.exports = readM
