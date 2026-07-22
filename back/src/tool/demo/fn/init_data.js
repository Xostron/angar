const data = {
	// Отработано циклов
	cur: null,
	//
	// Всего циклов из настроек
	total: null,
	// Номер текущего теста
	order: 0,
	// Точка отсчета демо
	timeD: null,
	// Точка отсчета текущего цикла
	timeC: null,
	// Точка отсчета текущего теста
	timeT: null,
	// Журнал логов по каждому тесту
	checklist: {
		valve: [],
		fan: [],
		allFan: [],
		accel: [],
		heat: [],
		wetting: [],
		ozon: [],
		cooler: [],
	},
}

// Настройки каждого этапа тестирования
const checklist = [
	{ code: 'valve', last: 60 * 1000 },
	{ code: 'fan', last: 60 * 1000 },
	{ code: 'allFan', last: 60 * 1000 },
	{ code: 'accel', last: 60 * 1000 },
	{ code: 'heat', last: 60 * 1000 },
	{ code: 'wetting', last: 60 * 1000 },
	{ code: 'ozon', last: 60 * 1000 },
	{ code: 'cooler_cool', last: 60 * 1000 },
	{ code: 'coolerFlap', last: 60 * 1000 },
	{ code: 'cooler_heat', last: 60 * 1000 },
]

module.exports = { initData: JSON.stringify(data), checklist }
