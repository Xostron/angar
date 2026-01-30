/**
 * Статистика электроизмерений Напряжения - Сбор данных периодически и по критическим изменениям
 */
async function pLogVoltage() {
	// 	await delay(store.tStat)
	// 	const data = await readTO(['building', 'section', 'device'])
	// 	// Электросчетчики
	// 	const pui = data.device.filter((el) => el.device.code === 'pui')
	// 	pLogConst(data, pui, store.value, 'watt')
		// Напряжение
	// TODO включить когда появится модуль 701 на стенде
	const pui = data.device.filter((el) => el.device.code === 'pui')
	pLog(data, pui, value, 'voltage', force)
}

module.exports = pLogVoltage