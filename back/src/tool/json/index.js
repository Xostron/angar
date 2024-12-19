const { retainDir, factoryDir, dataDir, tracingDir } = require('@store')
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path')

/**
 * Сохранить в json (ключ-файл)
 * @param {*} data объект
 * @param {*} ph путь сохранения
 * @param {*} ref
 * @param {*} toRetain log: запись в retain или в другой файл
 * @returns
 */
function write(data, ph = dataDir, ref, toRetain) {
	return new Promise((resolve, reject) => {
		// Создание папки
		if (!fs.existsSync(ph)) fs.mkdirSync(ph)
		// Проход по коллекциям и запись в файлы json
		const p = []
		const a = ref ?? Object.keys(data)
		for (const name of a) {
			const filepath = path.join(ph, name + '.json')
			const d = JSON.stringify(data?.[name] ?? [], null, ' ')
			p.push(fsp.writeFile(filepath, d))
		}
		Promise.all(p)
			.then((r) => {
				toRetain
					? console.log('\x1b[32m%s\x1b[0m', `Данные успешно сохранены в data/retain`)
					: console.log('\x1b[32m%s\x1b[0m', `Файл(ы) json успешно сохранены в ${ph}`)
				resolve()
			})
			.catch((error) => {
				console.log('\x1b[31m%s\x1b[0m', 'Ошибка сохранение json: ', error)
				reject(error)
			})
	})
}

/**
 * Создать или модифицировать файл json
 * @param {*} obj данные на сохранение
 * @param {*} ph путь до файла json
 */
function createAndModify(obj, filename, ph, cb) {
	return new Promise((resolve, reject) => {
		readOne(filename, ph)
			.then((d) => {
				const result = d ? cb(obj, d) : {}
				return write({ data: result }, ph, null, true)
			})
			.then(resolve)
			.catch(reject)
	})
}

/**
 * Прочитать файл json
 * @param {*} filename имя файла json
 * @param {*} ph путь до файла
 * @returns
 */
function readOne(filename, ph = dataDir) {
	return new Promise((resolve, reject) => {
		const filepath = filename.includes('.json') ? path.join(ph, filename) : path.join(ph, filename + '.json')
		if (!filename || !fs.existsSync(filepath)) return resolve(null)
		fsp.readFile(filepath)
			.then((doc) => {
				if (!!String(doc) === false) {
					return resolve(null)
				}
				const r = JSON.parse(doc)
				resolve(r)
			})
			.catch((err) => {
				resolve(null)
				console.log('@@@@', err)
			})
	})
}

/**
 * Прочитать файлы json
 * @param {*} names массив имен файлов json
 * @param {*} ph путь до файлов
 * @returns массив объектов
 */
function read(names, ph = dataDir) {
	const p = names.map((n) => readOne(n, ph))
	return Promise.all(p)
}

/**
 * Прочитать файлы json
 * @param {*} names массив имен файлов json
 * @param {*} ph путь до файлов
 * @returns объект
 */
function readTO(names, ph = dataDir) {
	return new Promise((resolve, reject) => {
		const p = names.map((n) => readOne(n, ph))
		Promise.all(p)
			.then((r) => {
				const obj = {}
				names.forEach((n, idx) => {
					const name = n.split('.')[0]
					if (r[idx]) obj[name] = r[idx]
				})
				resolve(obj)
			})
			.catch(reject)
	})
}

// Данные из файлов json
function readAll(obj) {
	return new Promise((resolve, reject) => {
		const list = Object.keys(obj.data)
		Promise.all([read(list), read(['data'], retainDir), read(['factory'], factoryDir), read(['ehour'], tracingDir)])
			.then(([eq, rtn, fct, ehour]) => {
				obj.retain = rtn[0]
				obj.factory = fct[0]
				obj.ehour = ehour[0]
				list.forEach((el, i) => {
					if (eq[i]) obj.data[el] = eq[i]
				})
				resolve()
			})
			.catch(reject)
	})
}

async function findOne(filename, q) {
	const { key, v } = q
	const data = await readOne(filename)
	const r = data.find((el) => el[key] === v)
	return r
}

function writeSync(data, ph = dataDir, ref, toRetain) {
	try {
		// Создание папки
		if (!fs.existsSync(ph)) fs.mkdirSync(ph)
		// Проход по коллекциям и запись в файлы json
		const a = ref ?? Object.keys(data)
		for (const name of a) {
			const filepath = path.join(ph, name + '.json')
			const d = JSON.stringify(data?.[name] ?? [], null, ' ')
			fs.writeFileSync(filepath, d)
		}
		toRetain
			? console.log('\x1b[32m%s\x1b[0m', `Данные успешно сохранены в data/retain`)
			: console.log('\x1b[32m%s\x1b[0m', `Файл(ы) json успешно сохранены в ${ph}`)
	} catch (error) {
		console.log('\x1b[31m%s\x1b[0m', 'Ошибка сохранение json: ', error)
	}
}

/**
 * Создать или модифицировать файл json
 * @param {*} obj данные на сохранение
 * @param {*} ph путь до файла json
 */
function createAndModifySync(obj, filename, ph, cb) {
	return new Promise((resolve, reject) => {
		readOne(filename, ph)
			.then((d) => {
				const result = d ? cb(obj, d) : {}
				return writeSync({ [filename]: result }, ph, null, true)
			})
			.then(resolve)
			.catch(reject)
	})
}

function debugJson(filename, data, ph) {
	writeSync({ [filename]: data }, path.resolve(ph ?? __dirname))
}

module.exports = {
	write,
	createAndModify,
	readOne,
	read,
	readTO,
	readAll,
	findOne,
	writeSync,
	createAndModifySync,
	debugJson,
}
