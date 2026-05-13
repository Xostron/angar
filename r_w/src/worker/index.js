const { parentPort, workerData, Worker, isMainThread } = require('worker_threads')
const os = require('os')
const arrData = require('./data')
const readTCP = require('../read/read_tcp')
const { partition, delay } = require('./fn')

// Если Node.js зашел в этот файл как в Воркер, вызываем функцию принудительно
if (!isMainThread) {
	fnThread()
}

async function fnThread(max) {
	if (isMainThread) {
		return manager(max)
	} else {
		await threadAction()
	}
}

module.exports = fnThread

// Менеджер запуска воркеров и сбора результата
function manager(max) {
	return new Promise((resolve, reject) => {
		// Основной поток. создание воркеров
		const total = os.cpus().length
		// Выбор кол-ва поток. кол-во ядер-1 или настройка max
		let num = Math.max(1, total - 1)
		num = max && num > max ? max : num
		// console.log(1, `Главный поток, запускаем потоки = `, num)

		// Распределение модулей по потокам
		const arrPart = partition(arrData, num)
		// console.log(2, 'Модули распределены по потокам', num)
		// Запуск воркеров
		let results = {}
		for (let i = 0; i < num; i++) {
			const part = arrPart[i]
			const worker = new Worker(__filename, {
				workerData: { id: i, arr: part },
			})
			// Слушаем ответ от потока
			worker.on('message', (r) => {
				// console.log(`Получен ответ от Worker ${i}`, result)
				results = { ...results, ...r }
				if (check(results, arrData.length)) resolve(results)
			})
			// При ошибке выполнения
			worker.on('error', (reason) => {
				part.forEach((mdl, i) => {
					results[mdl.ip + '_' + mdl.name] = `Worker ${i}. Error ${reason}`
				})
				if (check(results, arrData.length)) resolve(results)
			})
			// Остановка воркера по причине ОС
			worker.on('exit', (code) => {
				part.forEach((mdl, i) => {
					if (results[mdl.ip + '_' + mdl.name] === undefined)
						results[mdl.ip + '_' + mdl.name] = `Worker ${i}. Exit ${code}`
				})
				if (check(results, arrData.length)) resolve(results)
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
		await delay(50)
	}
	// console.log(`Воркер ${id} в работе`)
	parentPort.postMessage(r)
}

// Проверка кол-во модулей в results >= кол-во модулей arrData.length
function check(results, total = 0) {
	if (Object.keys(results).length >= total) return results
}
