const readJson = require('@tool/json').read
const read = require('@tool/control/read')
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
                // console.log(11, 'модули на чтение', arr)
				// Опрос модулей по сети
				return read(arr, obj)
			})
			.then((r) => {
				// console.log(99, 'Прочитанные данные с модулей', r)
				resolve(r)
			})
			.catch(reject)
	})
}

module.exports = readM
