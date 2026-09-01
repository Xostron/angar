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
		await delay(4000)
		Aboc.refresh()
		return obj.data.pc?.isIo
	} catch (error) {
		await delay(5000)
		exception(error)
	}
}

// Главный цикл управления
async function loop() {
	// Кол-во ядер ПЛК
	const total = os.cpus().length

	while (!store.shutdown) {
		// Точка отсчета цикла
		const bgn = hrtime()

		titleLog(total)

		// Инициализация глобального аккумулятора
		await writeStore()
		// Основной цикл программы
		store.isIo = await control()

		// Счетчик циклов
		store.cycleId = store.cycleId >= 32767 ? 0 : ++store.cycleId
		// Сброс флага первого цикла
		store._first = false

		// Время цикла, с
		store._cycle_ms_ = ((Number(hrtime() - bgn) / 1e6) | 0) / 1000

		// Доп задержка при слишком быстрых циклах (время обычного цикла от 0.3 сек)
		if (store._cycle_ms_ < 0.07) {
			await delay(5000)
			console.log('Включена защита при быстрых циклах < 0.07c => 5с')
		}

		// Сброс флага store.reset
		store.isIo ? null : reset(null, false, false)

		infoLog(store._cycle_ms_)

		// console.log('Использовано памяти: ', process.memoryUsage())
		// console.log('Статистика: ', v8.getHeapStatistics())
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

function titleLog(total, x = 30) {
	// В режиме микросервиса отображаем через каждые 8 циклов
	const t = `\n-------------------Начало Process ID: ${process.pid}. ID CYCLE ${store.cycleId}. Кол-во ядер ${total}-------------------`
	if (store.isIo && store.cycleId % x === 0) console.log('\x1b[35m%s\x1b[0m', t)
	// В режиме монолита отображаем всегда
	else if (!store.isIo) console.log('\x1b[35m%s\x1b[0m', t)
}

function infoLog(cycle, x = 30) {
	const t1 = `Режим  ${store.isIo ? 'микросервиса' : 'монолита'} `
	const t2 = `Время цикла ${cycle.toFixed(2) + ' сек'}`

	// В режиме микросервиса отображаем через каждые 8 циклов
	if (store.isIo && store.cycleId % x === 0) {
		console.log('\x1b[35m%s\x1b[0m', t1)
		console.log('\x1b[35m%s\x1b[0m', t2)
	}
	// В режиме монолита отображаем всегда
	else if (!store.isIo) {
		console.log('\x1b[35m%s\x1b[0m', t1)
		console.log('\x1b[35m%s\x1b[0m', t2)
	}
}

module.exports = loop
