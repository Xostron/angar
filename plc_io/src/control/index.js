const os = require('os')
const hrtime = process.hrtime.bigint
const { store } = require('@store/index')
const { delay } = require('@tool/time')
const collect = require('@tool/module/collect')
// const Aboc = require('@tool/abort_controller')
// const getOutput = require('@tool/module/get_output')
// const write = require('@tool/plc/write')
const { fnThreadPool } = require('../worker')
const postV = require('../client/value')
const { getRack } = require('../client/rack')

// Опрос модулей
async function main() {
	try {
		await getRack('init')
		// Получить раму модулей (store.mdls) и распределить на потоки (store.parts)
		collect(store.count)
		// Потоковое чтение модулей и сохранение в аккумулятор
		store.v = await fnThreadPool(store.count)
		// Отправка данных на сервер Ангара
		await postV()
		// Задержка 10 сек
		console.log(991, store._first, store.debMdl, store.alarm)
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
		// Задание кол-во ядер
		let sp = 3
		// Доступно ядер
		store.count = total - 1 > sp ? sp : total - 1
		console.log('****************CYCLE******************')
		console.log(`Всего ядер ${total}, доступно ${store.count}`)

		await main()

		const end = ((Number(hrtime() - bgn) / 1e6) | 0) / 1000
		// Флаг первого цикла
		store._first = false
		// Сброс аварии
		store.reset = false
		console.log('Время цикла = ', end, 'сек\n')
	}
}

module.exports = loop
