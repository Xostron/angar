const hrtime = process.hrtime.bigint
const os = require('os')
// const readThread = require('../worker')
const { store } = require('@store')
const collect = require('../tool/module/collect')
const { delay } = require('../tool/time')

// Опрос модулей
async function main(count) {
	try {
		// Получить раму модулей и распределить на потоки
		collect(count)
		console.log(33, store.parts.length)
		// Чтение модулей
		// const r = await readThread(count)
		// Сохраняем в аккумулятор
		// store.value = r
		// console.log(22, r)
		await delay(5000)
	} catch (error) {
		console.error(99, error)
		await delay(5000)
	}
}

// Главный цикл микросервеса
async function loop() {
	while (true) {
		const bgn = hrtime()
		// Всего ядер
		const total = os.cpus().length
		// Доступно ядер
		let sp = 3
		let count = total - 1 > sp ? sp : total - 1
		console.log('****************CYCLE******************')
		console.log(`Всего ядер ${total}, доступно ядер ${count}, запускаем опрос модулей\n`)

		await main(count)

		const end = ((Number(hrtime() - bgn) / 1e6) | 0) / 1000
		// Флаг первого цикла
		store._first = false
		console.log('Время цикла = ', end, 'сек\n')
	}
}

module.exports = loop
