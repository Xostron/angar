require('module-alias/register')
const { parentPort, workerData, Worker, isMainThread } = require('worker_threads')
const { check } = require('./fn')
const { store } = require('@store/index')
const read = require('@tool/plc/read')

// Пул многоразовых потоков
let pool = null

/**
 * Многоразовый поток
 * @param {*} max
 * @returns {object} Объект с ключами ИД модулей и значениями входов/выходов
 */
async function fnThreadPool(max) {
	// Для главного потока
	if (isMainThread) {
		// инициализация пула потоков
		initPool(max)
		return manager(max)
	}
}

/**
 * Инициализация пула потоков
 * @param {*} max Настройка: кол-во потоков
 * @returns
 */
function initPool(max) {
	if (!isMainThread || pool || !max || store.preMax===max) return 
	store.preMax = max
	pool = []
	// Создание многоразовых воркеров
	for (let i = 0; i < max; i++) createWorker(i)
}

function createWorker(idx) {
	// Инициализация воркера. workerData - статичные данные от главного потока
	const worker = new Worker(__filename, {
		workerData: { idx },
	})
	pool[idx] = worker
	// Воркер упал, создаем новый воркер
	worker.on('exit', (code) => {
		console.log('⛔ Worker Exit. Код', code)
		createWorker(idx)
	})
}

module.exports = { fnThreadPool }

/**
 * Менеджер многоразовых потоков
 * Выполнение в главном потоке
 * @param {*} max
 * @returns
 */
function manager(max) {
	return new Promise((resolve, reject) => {
		// Модули на чтение
		const length = store.mdls.length
		// Результат чтения модулей
		let results = {}
		if (!length || !max) return resolve(results)

		// Кол-во завершенных воркеров
		let finishedWorkers = 0
		// Создаем воркеры (потоки)
		for (let i = 0; i < max; i++) {
			const worker = pool[i]
			// Порция модулей на поток
			const part = store.parts[i]

			// Время вывполнения потока
			const start = new Date()

			// Отправляем воркеру данные из основного потока (part - модули, reset - сброс аварий)
			worker.postMessage({ part, reset: store.reset })

			// Слушаем ответ от потока (одноразовый)
			worker.once('message', (r) => {
				// У каждого потока свое окружение, поэтому аккумуляторы неисправносте и т.д.
				// сливаем вместе в  аккумуляторе главного потока
				results = { ...results, ...r.v }
				store.alarm.module = { ...store.alarm.module, ...(r.alarmMdl ?? {}) }
				store.cacheDO = { ...store.cacheDO, ...(r?.cacheDO ?? {}) }
				store.debMdl = { ...store.debMdl, ...(r.debMdl ?? {}) }
				// Время обработки потока
				const end = (new Date() - start) / 1000
				console.log(
					`✔️ ${i + 1} Поток завершен ${end}с. Кол-во модулей = ${part?.length}`,
					max,
				)

				if (check(max, ++finishedWorkers, pool)) {
					console.log(`✅ Все потоки выполнены. Всего модулей = ${length}`)
					resolve(results)
				}
			})

			// Ошибка потока
			worker.once('error', (reason) => {
				// Записываем в результат по модулям потока - причину ошибки
				part.forEach((mdl, i) => {
					mdl._id.forEach((id) => (results[id] = `Worker ${i}. Error ${reason}`))
				})
				console.log('❌ Ошибка потока', i, reason)
				if (check(max, ++finishedWorkers, pool)) {
					console.log(`✅ Все потоки выполнены. Всего модулей = ${length}`)
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
	parentPort.on('message', async ({ part, reset }) => {
		// Чтение модулей
		clear(reset)
		const r = await read(part)

		// Результат чтения
		parentPort.postMessage(r)
	})
}

function clear(reset, r) {
	if (!reset) return
	// сброс аккумулятор воркеров
	store.alarm.module = {}
	store.debMdl = {}
}
