const hrtime = process.hrtime.bigint
const os = require('os')
const writeVal = require('@tool/control/write/index')
const { cValue, cAlarm } = require('@socket/emit')
const { data: store } = require('@store/index')
const { delay } = require('@tool/command/time')
const webAlarm = require('@tool/web_alarm')
const { statOnChange } = require('../stat')
const analysis = require('./analysis')
const writeLock = require('./lock')
const convCmd = require('./output')
const main = require('./main')
const save = require('./save')
const data = require('./data')
const battery = require('@tool/scripts/battery')
const Aboc = require('@tool/abort_controller')
const writeStore = require('./save/extra')
const writeIO = require('../client/plc_io/write')
const resetIO = require('../client/plc_io/reset')
const { reset } = require('@tool/reset')

// Контроль работы склада
async function control() {
	try {
		// Проверка состояния батареи
		battery()
		// testBattery()
		// Начало отсчета цикла
		const obj = JSON.parse(data)
		// Анализ данных с модулей ПЛК и отправка на Web-клиент
		await Aboc.asycall(analysis)(obj)
		// await analysis(obj)
		// Логика
		Aboc.call(main)(obj)
		// Выхода: Команды управления
		Aboc.call(convCmd)(obj)
		// Выхода: Блокировки
		Aboc.call(writeLock)(obj)
		// writeLock(obj)
		// Выхода: Запись в модули: [микросервис] : [монолит]
		obj.data.pc?.isIo ? await writeIO(obj.output) : await writeVal(obj.output)
		obj.data.pc?.isIo ? await resetIO(obj.output) : null
		// Аварии для web
		const alr = await Aboc.asycall(webAlarm)(obj)
		// Статистика
		Aboc.call(statOnChange)(obj, alr?.history)
		// Сохранение пользовательских настроек склада retain/data.json
		await Aboc.asycall(save)(obj)

		// В режиме микросервиса
		obj.data.pc?.isIo ? await delay(300) : null
		// await save(obj)
		// await delay(4000)
		Aboc.refresh()
		return obj.data.pc?.isIo
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
		// Кол-во ядер ПЛК
		const total = os.cpus().length
		console.log(
			'\x1b[36m%s\x1b[0m',
			`\n-------------------Начало Process ID: ${process.pid}. ID CYCLE ${store.cycleId}. Кол-во ядер ${total}-------------------`,
		)

		// Инициализация глобального аккумулятора
		await writeStore()
		// Основной цикл программы
		const isIo = await control()

		// Счетчик циклов
		store.cycleId = store.cycleId >= 32767 ? 0 : ++store.cycleId
		// Сброс флага первого цикла
		store._first = false
		store._cycle_ms_ = (Number(hrtime() - bgn) / 1e6) | 0
		// Сброс флага store.reset
		isIo ? null : reset(null, false, false)
		console.log(`Режим  ${isIo ? 'микросервиса' : 'монолита'} `)
		console.log(
			'\x1b[33m%s\x1b[0m',
			`Время цикла ${(store._cycle_ms_ / 1000).toFixed(2) + ' сек'}`,
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

function testBattery() {
	// store.battery = true
	// blink
	// if (!store.battery) return (store.battery = true)
	// if (store.battery) return (store.battery = false)
}

module.exports = loop
