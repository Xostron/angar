const os = require('os')
const hrtime = process.hrtime.bigint
const { store } = require('@store/index')
const { delay } = require('@tool/time')
const collect = require('@tool/module/collect')
const { fnThreadPool } = require('../worker')
const postV = require('../client/value')
const extralrm = require('./extralrm')
const { writeOut } = require('@tool/module/get_output')

// Опрос модулей
async function main() {
	try {
		// store.mdls - module+equipment Массив у никальных модулей,
		// store.parts - подмассивы распределенные на потоки
		collect(store.max)
		// Потоковое чтение модулей и сохранение в аккумулятор
		store.v = await fnThreadPool(store.max)
		// Обработка авари
		await extralrm()
		//
		await writeOut(store.mdls)
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
		if (!store.max) {
			await delay(10000)
			continue
		}
		// Задание кол-во ядер

		// Доступно ядер
		store.max = total - 1 > store.max ? store.max : total - 1

		console.log(
			`*********[${new Date().toLocaleString()}] НАЧАЛО: Микросервис plc_io. PID:${process.pid}*********`,
		)
		console.log(`Всего ядер ${total}, доступно ${store.max}`)

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
