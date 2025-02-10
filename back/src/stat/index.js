const { pLogConst, pLog, alarmLog, eventLog, activityLog, sensTotalLog, sensLog } = require('./fn')
const { data: store } = require('@store')
const { delay } = require('@tool/command/time')
const { readTO } = require('@tool/json')

/**
 * Статистика датчиков
 */
async function statOnTime() {
	while (true) {
		// Задержка
		await delay(store.tStat)
		const data = await readTO(['building', 'section', 'sensor'])
		// Датчики (Total после анализа)
		sensTotalLog(store?.value?.total, data.building)
		// Лог по всем датчикам
		sensLog(data)
		console.log('\x1b[36m%s\x1b[0m', 'Статистика датчиков')
	}
}

/**
 * Статистика - сбор данных по изменению
 * @param {object} obj глобальный объект склада (рама, значения с модулей, аварии)
 * @param {object[]} alr данные для логирования неисправностей
 */
function statOnChange(obj, alr) {
	const { data, value } = obj
	const { critical, event, activity } = alr
	// Вентиляторы
	pLog(data, data.fan, value, 'fan')
	// Клапан
	pLog(data, data.valve, value, 'valve')
	// Обогрев
	pLog(data, data.heating, value.outputEq, 'heating')
	// Холодильник
	pLog(data, data.cooler, value, 'cooler')
	// Агрегат
	pLog(data, data.aggregate, value, 'aggregate')
	// Устройства (состояние)
	const dvc = data.device.filter((el) => el.device.code !== 'pui')
	pLog(data, dvc, value, 'device')
	// alarm - Критические неисправности
	alarmLog(critical)
	// event - Сообщения авторежимов
	// eventLog(event)
	// activity - Действия пользователя
	// activityLog()
}

/**
 * Электросчетчик: насчитанные кВт за 10 мин
 * Каждую сек аккумулируем значение кВт, на 10 минуте считаем результат и записываем в лог
 */
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

module.exports = { statOnChange, statOnTime, statOnTimePui }
