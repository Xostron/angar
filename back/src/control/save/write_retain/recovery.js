const fs = require('fs')
const path = require('path')
const fsp = require('fs').promises
const {  readOne } = require('@tool/json')
const { retainDir } = require('@store')
const retainFile = path.join(retainDir, 'data1.json')

/**
 * Проверка и создание папки и файла retain
 */
function isExist() {
	const exist = fs.existsSync(retainDir)
	const existFile = fs.existsSync(retainFile)
	if (!exist) {
		fs.mkdirSync(retainDir)
		console.log(`\tСоздание папки ${retainDir}`)
	}
	if (!existFile) {
		fs.writeFileSync(retainFile, '{}')
		console.log(`\tСоздание файла ${retainFile}`)
	}
}

/**
 * Проверка целостности файла и восстановление
 * @returns {object} данные файла retain JSON-объект
 */
async function recovery() {
	// Чтение файла (prime - данные файла)
	let data = await readOne('data1.json', retainDir)
	// Файл поврежден -> восстанавливаем файл (пока запишем пустой объект, в дальнейшем, от резервной копии)
	if (data === null) {
		fs.writeFileSync(retainFile, '{}')
		// Перечитываем
		data = await readOne('data1.json', retainDir)
		console.log('\tВосстановление файла')
	}
	return data
}

module.exports = { isExist, recovery }
