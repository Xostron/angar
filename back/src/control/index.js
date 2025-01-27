const { data: store, reset, accDir } = require('@store')
const writeVal = require('@tool/control/write/index')
const { cValue, cAlarm } = require('@socket/emit')
const { delay } = require('@tool/command/time')
const webAlarm = require('@tool/web_alarm')
const monitoring = require('./monitoring')
const statistic = require('./statistic')
const analysis = require('./analysis')
const hrtime = process.hrtime.bigint
const writeLock = require('./lock')
const convCmd = require('./output')
const main = require('./main')
const save = require('./save')
const data = require('./data')

// Контроль работы склада
async function control() {
	try {
		// TODO
		console.log('\x1b[36m%s\x1b[0m', '\n-------------------Начало-------------------')
		// Начало отсчета цикла
		const obj = JSON.parse(data)
		// Анализ данных с модулей ПЛК и отправка на Web-клиент
		await analysis(obj)
		// Логика
		main(obj)
		// Выхода: Команды управления
		convCmd(obj)
		// Выхода: Блокировки
		writeLock(obj)
		// Выхода: Запись в модули
		await writeVal(obj.output)
		// Запись в retain файл json
		await save(obj)
		// Аварии для web
		let alr = await webAlarm(obj)
		// Мониторинг
		alr = monitoring(alr.signal)
		// Статистика
		statistic(obj, alr)
		// Задержка цикла
		await delay(store.tDelay)
		// Обнулить команду reset (кнопка сброса аварии)
		reset({}, false)
		// console.log(222, store.value)
		if (store._cycle_ms_ < 650) await delay(2000)
		console.log('\x1b[33m%s\x1b[0m', `Время цикла ${(store._cycle_ms_ / 1000).toFixed(2) + ' сек'}`)
		return true
	} catch (error) {
		await delay(2000)
		exception(error)
	}
}

// Главный цикл управления
async function loop() {
	while (true) {
		const bgn = hrtime()
		await control()
		store._cycle_ms_ = (Number(hrtime() - bgn) / 1e6) | 0
		store._first = false
	}
}

// Обработка ошибок сервера
function exception(err) {
	console.log('Control error: ', err)
	// Web: socket ошибка сервера
	const e = err.toString().slice(7)
	cAlarm([{ type: 'alr', message: e }])
	// Web: socket пустые значения
	cValue({})
}

module.exports = loop
