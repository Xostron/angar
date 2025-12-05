require('module-alias/register')
const fs = require('fs')
const path = require('path')
const fsp = require('fs').promises
const { readOne } = require('@tool/json')
const { data: store, retainDir } = require('@store')
const retainFile = path.join(retainDir, 'data.json')

/**
 * Проверка и создание папки и файла retain
 */
function fnExist() {
	const exist = fs.existsSync(retainDir)
	const existFile = fs.existsSync(retainFile)
	if (!exist) {
		fs.mkdirSync(retainDir, { recursive: true });
		console.log(`\tСоздание папки ${retainDir}`);
	}
	if (!existFile) {
		fs.writeFileSync(retainFile, '{}')
		console.log(`\tСоздание файла ${retainFile}`)
	}
}

/**
 * Проверка целостности файла и восстановление + чтение файла retain
 * @returns {object} данные файла retain JSON-объект
 */
async function recovery() {
	// Чтение файла (prime - данные файла)
	let data = await readOne('data.json', retainDir)
	// Файл поврежден -> восстанавливаем файл (пока запишем пустой объект, TODO от резервной копии)
	if (data === null) {
		fs.writeFileSync(retainFile, '{}')
		// Перечитываем
		data = await readOne('data.json', retainDir)
		console.log('\tВосстановление файла')
	}
	return data
}

/**
 * Аккумулятор store.retain:
 * 1. Происходит проверка на существование файла retain.json (если его нет, то создаем с пустым объектом)
 * 2. Если файл существует, то проверяем что там не null
 * 3. Записываем все данные файла в аккумулятор: происходит 1 раз при запуске проекта
 * Далее все данные от мобильного/web приложения и логики программы, которые требуют сохранения данных
 * в файл retain, записываются в аккумулятор, в конце цикла происходит запись аккумулятор в файл
 *
 * Примечание: Каждый цикл программы инициализируется новый объект obj - глобальные данные,
 * который содержит раму конфигурации, анализ с входов, а также данные из аккумулятора retain.
 *
 */
async function readRetain() {
	// Проверка и создание папки и файла retain
	fnExist()
	store.retain = await recovery()
}

module.exports = readRetain
