const { retainDir, accDir } = require('@store')
const writeAcc = require('./write_acc')
const { writeRetain, writeRetainOld } = require('./write_retain')

// Сохранение в файл retain (Настройки, режимы работы и т.д.)
async function save(obj) {
	try {
		await writeAcc(obj)
	} catch (error) {
		console.error(`Ошибка записи файла ${accDir}/acc.json`, error)
	}
	try {
		await writeRetainOld(obj)
		await writeRetain(obj)
	} catch (error) {
		console.error(`Ошибка записи файла ${retainDir}/data.json`, error)
	}
}

module.exports = save
