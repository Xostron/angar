const { pLogConst, pLog, alarmLog, sensLog } = require('./fn')
const { data: store } = require('@store')
const { delay } = require('@tool/command/time')
const { readTO } = require('@tool/json')

async function statOnTime() {
	while (true) {
		await delay(store.tStat)
		const data = await readTO(['building', 'section', 'device'])
		// Электросчетчики
		const pui = data.device.filter((el) => el.device.code === 'pui')
		pLogConst(data, pui, store.value, 'watt')
		// Датчики
		sensLog(store?.value?.total, data.building)
		console.log('\x1b[36m%s\x1b[0m', 'Статистика')
	}
}

/**
 * Статистика - сбор данных по изменению
 * @param {object} obj глобальный объект склада (рама, значения с модулей, аварии)
 * @param {object[]} alr данные для логирования неисправностей
 */
function statOnChange(obj, alr) {
	const { data, value } = obj
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
	// Критические Неисправности
	alarmLog(alr)
	// activity - действия пользователя
}

module.exports = { statOnChange, statOnTime }
