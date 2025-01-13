const { pLog, alarmLog, sensLog } = require('./fn')
/**
 * Статистика - сбор данных по изменению
 * @param {object} obj глобальный объект склада (рама, значения с модулей, аварии)
 * @param {object[]} alr данные для логирования неисправностей
 */
function statistic(obj, alr) {
	const { data, value } = obj
	// Вентиляторы
	pLog(data.fan, value, 'fan')
	// Клапан
	pLog(data.valve, value, 'valve')
	// Обогрев
	pLog(data.heating, value.outputEq, 'heating')
	// Холодильник
	pLog(data.cooler, value, 'cooler')
	// Агрегат
	pLog(data.aggregate, value, 'aggregate')
	// Устройства
	pLog(data.device, value, 'device')
	// Датчики
	sensLog(value.total, data.building)
	// Неисправности
	alarmLog(alr)
}

module.exports = statistic
