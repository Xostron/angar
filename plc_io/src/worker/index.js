require('module-alias/register')
const { parentPort, workerData, Worker, isMainThread } = require('worker_threads')
const { check } = require('./fn')
const { store } = require('@store')
const read = require('@tool/plc/read')

// Пул многоразовых потоков
let pool = null

// Инициализация пула потоков
/**
 *
 * @param {*} count Настройка: кол-во потоков
 * @returns
 */
function initPool(count) {
	if (!isMainThread || pool) return
	pool = []

	// Создание многоразовых воркеров
	for (let i = 0; i < count; i++) createWorker(i)
}

function createWorker(idx) {
	const worker = new Worker(__filename, { workerData: { idx } })
	pool[idx] = worker
	// Воркер упал, создаем новый воркер
	worker.on('exit', (code) => {
		console.log('Worker Exit. Код', code)
		createWorker(idx)
	})
}

// Многоразовый поток
/**
 *
 * @param {*} count
 * @returns {object} Объект с ключами ИД модулей и значениями входов/выходов
 */
async function fnThreadPool(count) {
	// Для главного потока
	if (isMainThread) {
		// инициализация пула потоков
		initPool(count)
		return manager(count)
	}
}

module.exports = { fnThreadPool, initPool }

/**
 * Менеджер многоразовых потоков
 * @param {*} count
 * @returns
 */
function manager(count) {
	return new Promise((resolve, reject) => {
		// Модули на чтение
		const length = store.mdls.length
		// Результат чтения модулей
		let results = {}
		if (!length) return resolve(results)

		// Кол-во завершенных воркеров
		let finishedWorkers = 0

		// Создаем воркеры (потоки)
		for (let i = 0; i < count; i++) {
			const worker = pool[i]
			// Порция модулей на поток
			const part = store.parts[i]
			// Время вывполнения потока
			const start = new Date()

			// Отправляем задачу потоку
			worker.postMessage(part)

			// Слушаем ответ от потока (одноразовый)
			worker.once('message', (r) => {
				results = { ...results, ...r }
				// Время обработки потока
				const end = (new Date() - start) / 1000
				console.log('Поток в работе', i, end, 's')

				if (check(count, ++finishedWorkers, pool)) {
					console.log('Потоки завершены')
					resolve(results)
				}
			})

			// Ошибка потока
			worker.once('error', (reason) => {
				// Записываем в результат по модулям потока - причину ошибки
				part.forEach((mdl, i) => {
					mdl._id.forEach((id) => (results[id] = `Worker ${i}. Error ${reason}`))
				})
				console.log('Ошибка потока', i, reason)
				if (check(count, ++finishedWorkers, pool)) {
					console.log('Потоки завершены')
					resolve(results)
				}
			})
		}
	})
}

// Обработчик потоков - action
if (!isMainThread) {
	const { idx } = workerData // id получаем один раз при старте

	// Слушаем данные для воркера от главного потока
	parentPort.on('message', async (part) => {
		// Чтение модулей
		const r = await read(part)
		// Результат чтения
		parentPort.postMessage(r)
	})
}
