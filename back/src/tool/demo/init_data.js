const data = {
	// Отработано циклов
	cur: 0,
	// Всего циклов из настроек
	total: null,
	// Номер текущего теста
	order: 0,
	// Массив тестов
	legio: [
		'valve',
		'fan',
		'allFan',
		'accel',
		'heat',
		'wetting',
		'ozon',
		'cooler_cool',
		'coolerFlap',
		'cooler_heat',
	],
	// Журнал сообщений по пройденным тестам
	checklist: {
		// valve: [],
		// fan: [],
		// allFan: [],
		// accel: [],
		// heat: [],
		// wetting: [],
		// ozon: [],
		// cooler_cool: [],
		// coolerFlap: [],
		// cooler_heat: [],
	},
}

module.exports = JSON.stringify(data)
