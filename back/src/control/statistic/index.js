const { pLog, alarmLog, sensLog } = require('./fn')
/**
 * Статистика - сбор данных по изменению
 * @param {object} obj глобальный объект склада (рама, значения с модулей, аварии)
 * @param {object[]} alr данные для логирования неисправностей
 */
function statistic(obj, alr) {
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
	const dvc = data.device.filter(el=>el.device.code!=='pui')
	pLog(data, dvc, value, 'device')
	// Электросчетчики
	const pui = data.device.filter(el=>el.device.code==='pui')
	pLog(data, pui, value, 'watt')
	// Датчики
	sensLog(value.total, data.building)
	// Неисправности
	alarmLog(alr)
	// activity - действия пользователя
}

module.exports = statistic
