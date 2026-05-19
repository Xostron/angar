const os = require('os')
const hrtime = process.hrtime.bigint
const { store } = require('@store')
const readThread = require('@worker')
const { delay } = require('@tool/time')
const collect = require('@tool/module/collect')
const Aboc = require('@tool/abort_controller')
const getOutput = require('@tool/module/get_output')
const write = require('@tool/plc/write')

// Опрос модулей
async function main(count) {
	try {
		// Чтение модулей
		// Получить раму модулей (store.mdls) и распределить на потоки (store.parts)
		collect(count)
		// Потоковое чтение модулей
		const r = await readThread(count)
		// Сохраняем в аккумулятор
		store.value = r

		// Запись модулей
		store.output = getOutput(store.mdls, store.value, store.out)
		await write(store.output)

		Aboc.refresh()
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
		// Задание кол-во ядер
		let sp = 3
		// Доступно ядер
		let count = total - 1 > sp ? sp : total - 1
		console.log('****************CYCLE******************')
		console.log(`Всего ядер ${total}, доступно ${count}`)

		await main(count)

		const end = ((Number(hrtime() - bgn) / 1e6) | 0) / 1000
		// Флаг первого цикла
		store._first = false
		console.log('Время цикла = ', end, 'сек\n')
	}
}

module.exports = loop
