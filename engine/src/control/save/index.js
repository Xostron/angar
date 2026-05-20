const { retainDir, accDir } = require('@store')
const writeAcc = require('./alarm')
const writeRetain = require('./retain')
const writeStore = require('./extra')

// Сохранение в файл retain (Настройки, режимы работы и т.д.)
async function save(obj) {
	try {
		writeRetain(obj)
	} catch (error) {
		console.error(`Ошибка записи файла ${retainDir}/data.json`, error)
	}
	try {
		await writeAcc(obj)
	} catch (error) {
		console.error(`Ошибка записи файла ${accDir}/acc.json`, error)
	}
}

module.exports = save
