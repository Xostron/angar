const pLog = require('../fn/plog')
/**
 * Статистика электроизмерений Напряжения - Сбор данных периодически и по критическим изменениям
 */
async function pLogVoltage(data, value, force) {
	const pui = data.device.filter((el) => el.device.code === 'pui')
	if (!pui?.length) return

	pLog(data, pui, value, 'voltage', force)
}

module.exports = pLogVoltage
