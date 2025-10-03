// Структура данных для работы основного цикла
const obj = {
	// файлы json - оборудование
	data: {
		building: [],
		section: [],
		module: [],
		equipment: {},
		sensor: [],
		valve: [],
		fan: [],
		heating: [],
		solenoid: [],
		cooler: [],
		signal: [],
		aggregate: [],
		binding: [],
		device: [],
		weather:{}
	},
	// файл json - Сохраненые настройки, калибровки, режимы
	retain: {},
	// файл json - Заводские настройки
	factory: {},
	// Опрос модулей + анализ
	value: null,
	// Запись в модули
	output: {},
	connection: '',
	prepareToAuto: {},
}

module.exports = JSON.stringify(obj)
