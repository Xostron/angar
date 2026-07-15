const os = require('os')
const hrtime = process.hrtime.bigint
const { shoutdownOut } = require('@tool/module/get_output')
const collect = require('@tool/module/collect')
const { fnThreadPool } = require('../worker')
const { store } = require('@store/index')
const { delay } = require('@tool/time')
const extralrm = require('./extralrm')

// Опрос модулей
async function main() {
	try {
		// store.mdls - module+equipment массив уникальных модулей,
		// store.parts - подмассивы распределенные на потоки
		collect(store.max)
		// Потоковое чтение модулей и сохранение в аккумулятор
		store.v = await fnThreadPool(store.max)
		// Генерация сообщений о неисправности модулей
		await extralrm()
		// Аварийное отключение выходов
		await shoutdownOut(store.mdls)
		// Задержка 10 сек
		Object.keys(store.v ?? {}).length ? await delay(10000) : await delay(5000)
	} catch (error) {
		console.error(99, error)
		await delay(3000)
	}
}

// Главный цикл микросервеса
async function loop() {
	while (true) {
		const bgn = hrtime()
		// Всего ядер
		const total = os.cpus().length
		// Если от ангара нет данных о кол-ве потоков, то ничего не делаем 10 сек
		if (!store.max) {
			await delay(10000)
			continue
		}

		// От ангара пришли данные
		// Фиксируем кол0во доступных ядер
		store.max = total - 1 > store.max ? store.max : total - 1

		console.log(
			`*********[${new Date().toLocaleString()}] НАЧАЛО: Микросервис plc_io. PID:${process.pid}*********`,
		)
		console.log(`Всего ядер ${total}, доступно ${store.max}`)
		// Главная часть программы
		await main()

		const end = ((Number(hrtime() - bgn) / 1e6) | 0) / 1000
		// Флаг первого цикла
		store._first = false
		// Сброс аварии
		store.reset = false
		console.log('\x1b[33m%s\x1b[0m', 'Время цикла = ', end, 'сек\n')
	}
}

module.exports = loop
