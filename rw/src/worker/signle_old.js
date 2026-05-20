require('module-alias/register')
const { parentPort, workerData, Worker, isMainThread } = require('worker_threads')
const { check } = require('./fn')
const { store } = require('@store')
const read = require('@tool/plc/read')

// Если Node.js зашел в этот файл как в Воркер, вызываем функцию принудительно
if (!isMainThread) {
	readThread()
}

/**
 * Потоковое чтение модулей
 * @param {number} count Настройка кол-ва потоков
 * @returns {object} Объект с ключами ИД модулей и значениями входов/выходов
 */
async function readThread(count) {
	if (isMainThread) {
		// Если вызван в главном потоке, отрабатывает Менеджер создания воркеров
		return manager(count)
	} else {
		// Если вызван Воркером, отрабатывает обработчик потока - чтение модулей
		await threadAction()
	}
}

module.exports = readThread

/**
 * Менеджер запуска воркеров и сбора результата
 * @param {*} count Кол-во потоков
 * @returns
 */
function manager(count) {
	return new Promise((resolve, reject) => {
		const length = store.mdls.length
		// Запуск воркеров
		let results = {}
		if (!length) return resolve(results)
		// Кол-во завершенных воркеров
		let countWorker = 0
		// Создание потоков
		for (let i = 0; i < count; i++) {
			const part = store.parts[i]
			const worker = new Worker(__filename, {
				workerData: { id: i, arr: part },
			})
			const time = new Date()
			// Слушаем ответ от потока (threadAction), собираем результат
			worker.on('message', (r) => {
				results = { ...results, ...r }
				console.log('Поток в работе', i, (new Date() - time) / 1000, 's')
			})

			// При ошибке выполнения
			worker.on('error', (reason) => {
				part.forEach((mdl, i) => {
					mdl._id.forEach((id) => (results[id] = `Worker ${i}. Error ${reason}`))
				})
			})

			// Завершение работы воркера, очистка воркера из памяти
			worker.on('exit', (code) => {
				part.forEach((mdl, i) => {
					if (results[mdl._id[0]] === undefined)
						mdl._id.forEach((id) => (results[id] = `Worker ${i}. Exit ${code}`))
				})
				console.log('Поток завершен', i)
				countWorker++
				if (check(count, countWorker)) resolve(results)
			})
		}
	})
}

// Обработчик потока - читаем модули
async function threadAction() {
	// arr - модули на чтение в данном потоке
	const { id, arr } = workerData
	const r = await read(arr)
	parentPort.postMessage(r)
}
