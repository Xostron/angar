const hrtime = process.hrtime.bigint
const os = require('os')
const { partition } = require('../worker/fn')
const readThread = require('../worker')
const { store } = require('@store')

// Опрос модулей
async function main(count) {
	try {
		// Получить раму модулей
		
		// Распределение модулей по потокам
		const parts = partition(mdls, count)
		// Чтение модулей
		const r = await readThread(parts, mdls.length, count)
		// Сохраняем в аккумулятор
		store.value = r
	} catch (error) {
		console.log(99, error)
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
		console.log(`Всего ядер ${total}, доступно ядер ${count}, запускаем опрос модулей\n`)

		await main(count)

		const end = ((Number(hrtime() - bgn) / 1e6) | 0) / 1000
		console.log('Время цикла = ', end, 'сек\n')
	}
}

module.exports = loop
