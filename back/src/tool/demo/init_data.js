const data = {
	// Отработано циклов
	cur: null,
	// Всего циклов из настроек
	total: null,
	// Номер текущего теста
	order: 0,
	// Массив тестов + журнал логов по каждому тесту
	checklist: [
		{ code: 'valve', last: 60 * 1000, logs: [] },
		{ code: 'fan', last: 60 * 1000, logs: [] },
		{ code: 'allFan', last: 60 * 1000, logs: [] },
		{ code: 'accel', last: 60 * 1000, logs: [] },
		{ code: 'heat', last: 60 * 1000, logs: [] },
		{ code: 'wetting', last: 60 * 1000, logs: [] },
		{ code: 'ozon', last: 60 * 1000, logs: [] },
		{ code: 'cooler_cool', last: 60 * 1000, logs: [] },
		{ code: 'coolerFlap', last: 60 * 1000, logs: [] },
		{ code: 'cooler_heat', last: 60 * 1000, logs: [] },
	],
}

module.exports = JSON.stringify(data)
