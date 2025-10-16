const { retainDir, accDir } = require('@store')
const writeAcc = require('./write_acc')
const writeRetain = require('./write_retain')

// Сохранение в файл retain (Настройки, режимы работы и т.д.)
async function save(obj) {
	try {
		// await writeRetainOld(obj)
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
