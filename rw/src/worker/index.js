const { parentPort, workerData, Worker, isMainThread } = require('worker_threads')
const readTCP = require('../read/read_tcp')
const { check } = require('./fn')
const { store } = require('@store')
const { delay } = require('../tool/time')
const fnParts = require('./partition')

// Если Node.js зашел в этот файл как в Воркер, вызываем функцию принудительно
if (!isMainThread) {
	fnThread()
}

/**
 * Потоковое чтение модулей
 * @param {object[][]} parts Подмассивы с модулями, для каждого потока свой набор модулей
 * @param {number} length Кол-во модулей
 * @param {number} count Настройка кол-ва потоков
 * @returns {object} Объект с ключами ИД модулей и значениями входов/выходов
 */
async function readThread(parts, length, count) {
	if (isMainThread) {
		// Если вызван в главном потоке, отрабатывает Менеджер создания воркеров
		return manager(parts, length, count)
	} else {
		// Если вызван Воркером, отрабатывает обработчик потока - чтение модулей
		await threadAction()
	}
}

module.exports = readThread

// Менеджер запуска воркеров и сбора результата
function manager(mdls, count) {
	return new Promise((resolve, reject) => {
		// Распределение модулей по потокам
		fnParts(mdls, count)
		const length = mdls?.length ?? 0

		// Запуск воркеров
		let results = {}
		for (let i = 0; i < count; i++) {
			const part = store.parts[i]
			const worker = new Worker(__filename, {
				workerData: { id: i, arr: part },
			})

			// Слушаем ответ от потока
			worker.on('message', (r) => {
				// console.log(`Получен ответ от Worker ${i}`, result)
				results = { ...results, ...r }
				if (check(results, length)) resolve(results)
			})

			// При ошибке выполнения
			worker.on('error', (reason) => {
				part.forEach((mdl, i) => {
					results[mdl.ip + '_' + mdl.name] = `Worker ${i}. Error ${reason}`
				})
				if (check(results, length)) resolve(results)
			})

			// Остановка воркера по причине ОС
			worker.on('exit', (code) => {
				part.forEach((mdl, i) => {
					if (results[mdl.ip + '_' + mdl.name] === undefined)
						results[mdl.ip + '_' + mdl.name] = `Worker ${i}. Exit ${code}`
				})
				if (check(results, length)) resolve(results)
			})
		}
	})
}

// Обработчик потока - читаем модули
async function threadAction() {
	// 2. Мы внутри воркера (Сотрудник).
	// Читаем данные из "чемоданчика" (workerData)
	const { id, arr } = workerData
	const r = {}
	for (const mdl of arr) {
		r[mdl.ip + '_' + mdl.name] = await readTCP(mdl.ip, mdl.port, mdl)
		// Пауза перед опросом следующего модуля (без этой паузы модули читаются не стабильно)
		await delay(store.tPause)
	}
	// console.log(`Воркер ${id} в работе`)
	parentPort.postMessage(r)
}
