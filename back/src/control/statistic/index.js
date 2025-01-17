const { pLog, alarmLog, sensLog } = require('./fn')
/**
 * Статистика - сбор данных по изменению
 * @param {object} obj глобальный объект склада (рама, значения с модулей, аварии)
 * @param {object[]} alr данные для логирования неисправностей
 */
function statistic(obj, alr) {
	const { data, value } = obj

	// Вентиляторы
	pLog(data.section, data.fan, value, 'fan')
	// Клапан
	pLog(data.section, data.valve, value, 'valve')
	// Обогрев
	pLog(data.section, data.heating, value.outputEq, 'heating')
	// Холодильник
	pLog(data.section, data.cooler, value, 'cooler')
	// Агрегат
	pLog(data.section, data.aggregate, value, 'aggregate')
	// Устройства
	pLog(data.section, data.device, value, 'device')
	// Датчики
	sensLog(value.total, data.building)
	// Неисправности
	alarmLog(alr)
}

module.exports = statistic


