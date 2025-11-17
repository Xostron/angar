const { sensTotalLog, pLogConst } = require('./sensor')
const historyLog = require('./history')
const pLog = require('./periph')
const { delay } = require('@tool/command/time')
const { data: store } = require('@store')
const { readTO } = require('@tool/json')

/**
 * Статистика - сбор данных по изменению (Главный цикл)
 * @param {object} obj глобальный объект склада (рама, значения с модулей, аварии)
 * @param {object[]} alr данные для логирования неисправностей
 */
function statOnChange(obj, alr) {
	if (!alr || !obj?.value) return
	const { data, value } = obj
	const { critical, event } = alr
	const force = TT.check()
	// Вентиляторы
	pLog(data, data.fan, value, 'fan', force)
	// Клапан
	pLog(data, data.valve, value, 'valve', force)
	// Обогрев
	pLog(data, data.heating, value.outputEq, 'heating', force)
	// Холодильник
	pLog(data, data.cooler, value, 'cooler', force)
	// Агрегат
	pLog(data, data.aggregate, value, 'aggregate', force)
	// Устройства (состояние)
	const dvc = data.device.filter((el) => el.device.code !== 'pui')
	pLog(data, dvc, value, 'device', force)
	// alarm - Критические неисправности
	historyLog(critical, store.prev.critical, 'alarm', force)
	// event - Сообщения о работе склада
	historyLog(event, store.prev.event, 'event', force)
	if (force) {
		// Датчики (Total после анализа)
		sensTotalLog(store?.value?.total, data.building, force)
		// Лог по всем датчикам
		pLogConst(data, data.sensor, store.value, 'sensor', force)
	}
}

/**
 * Статистика датчиков - (Цикл с заданным периодом 10 мин)
 */
async function statOnTime() {
	while (true) {
		// Задержка
		await delay(store.tStat)
		// await delay(5000)
		const data = await readTO(['building', 'section', 'sensor','cooler'])
		// Датчики (Total после анализа)
		sensTotalLog(store?.value?.total, data.building)
		// Лог по всем датчикам
		pLogConst(data, data.sensor, store.value, 'sensor')
		console.log('\x1b[36m%s\x1b[0m', 'Статистика датчиков')
	}
}

/**
 * Электросчетчик: насчитанные кВт за 10 мин
 */
// TODO Каждую сек аккумулируем значение кВт, на 10 минуте считаем результат и записываем в лог
async function statOnTimePui() {
	while (true) {
		// Задержка
		await delay(store.tStat)
		const data = await readTO(['building', 'section', 'device'])
		// Электросчетчики
		const pui = data.device.filter((el) => el.device.code === 'pui')
		pLogConst(data, pui, store.value, 'watt')
	}
}

/**
 * Текущее время наступило
 * @param {*} time
 * @returns
 */
class timeTrigger {
	_once = false
	_stamp = null
	constructor(hh, mm, ss) {
		this.stamp = new Date()
		this.stamp.setHours(hh ?? 0)
		this.stamp.setMinutes(mm ?? 0)
		this.stamp.setSeconds(ss ?? 0)
	}
	check() {
		const cur = new Date()
		if (cur < this.stamp) this._once = false
		if (cur >= this.stamp && !this._once) {
			this._once = true
			// После срабатывания - увеличиваем время на сутки, для сброса _once
			const t = this.stamp.getTime() + 24 * 60 * 60 * 1000
			this.stamp = new Date(t)
		}
		return this._once
	}
}
const TT = new timeTrigger(23, 59)

module.exports = { statOnChange, statOnTime, statOnTimePui }
