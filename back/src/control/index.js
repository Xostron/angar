const writeVal = require('@tool/control/write/index')
const { cValue, cAlarm } = require('@socket/emit')
const { data: store } = require('@store')
const { delay } = require('@tool/command/time')
const webAlarm = require('@tool/web_alarm')
const { statOnChange } = require('../stat')
const analysis = require('./analysis')
const hrtime = process.hrtime.bigint
const { zero } = require('@tool/zero')
const writeLock = require('./lock')
const convCmd = require('./output')
const main = require('./main')
const save = require('./save')
const data = require('./data')
const battery = require('@tool/scripts/battery')

// Контроль работы склада
async function control() {
	try {
		// Проверка состояния батареи
		battery()
		// Начало отсчета цикла
		const obj = JSON.parse(data)
		// Анализ данных с модулей ПЛК и отправка на Web-клиент
		await analysis(obj)
		// console.log(obj.data.fan)
		// Логика
		main(obj)
		// Выхода: Команды управления
		convCmd(obj)
		// Выхода: Блокировки
		writeLock(obj)
		// Выхода: Запись в модули
		await writeVal(obj.output)
		// Сохранение пользовательских настроек склада retain/data.json
		await save(obj)
		// Аварии для web
		const alr = await webAlarm(obj)
		// Статистика
		statOnChange(obj, alr.history)
		// обнулить счетчик сушки
		zero(null, false)
		// await delay(5000)
		if (store._cycle_ms_ < 50) await delay(1000)
		return true
	} catch (error) {
		await delay(5000)
		exception(error)
	}
}

// Главный цикл управления
async function loop() {
	while (!store.shutdown) {
		// Точка отсчета цикла
		const bgn = hrtime()
		console.log(
			'\x1b[36m%s\x1b[0m',
			`\n-------------------Начало Process ID: ${process.pid}-------------------`
		)
		await control()
		store._first = false
		store._cycle_ms_ = (Number(hrtime() - bgn) / 1e6) | 0
		console.log(
			'\x1b[33m%s\x1b[0m',
			`Время цикла ${(store._cycle_ms_ / 1000).toFixed(2) + ' сек'}`
		)
	}
	// Graceful Shutdown
	store.end = true
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
