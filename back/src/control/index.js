const writeVal = require('@tool/control/write/index')
const webAlarm = require('@tool/web_alarm')
const { delay } = require('@tool/command/time')
const { cValue, cAlarm } = require('@socket/emit')
const analysis = require('./analysis')
const main = require('./main')
const writeLock = require('./lock')
const convCmd = require('./output')
const save = require('./save')
const data = require('./data')
const hrtime = process.hrtime.bigint
const statistic = require('./statistic')
const monitoring = require('./monitoring')
const { data: store, reset } = require('@store')

// Главный цикл управления
async function loop() {
	while (true) {
		const bgn = hrtime()
		await control()
		store._cycle_ms_ = (Number(hrtime() - bgn) / 1e6) | 0
	}
}

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
		// Обнулить команду reset
		reset({}, false)
		// TODO
		if (store._cycle_ms_ < 50) await delay(2000)
		console.log('\x1b[33m%s\x1b[0m', `Время цикла ${(store._cycle_ms_ / 1000).toFixed(2) + ' сек'}  ${store._cycle_ms_}`)
		return true
	} catch (error) {
		await delay(2000)
		exception(error)
	}
}

// Обработка ошибок сервера
function exception(err) {
	const e = err.toString().slice(7)
	console.log('@@@ ОШИБКА', err)
	// Ошибка сервера
	cAlarm([{ type: 'alr', message: e }])
	cValue({})
}

module.exports = loop
