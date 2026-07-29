const data = {
	// Отработано циклов
	cur: null,
	// Флаг завершения демо - все исполнительные механизмы выключаем
	// true - однократная остановка уже выполнена
	firstOff: true,
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
		valve: {},
		fan: {},
		allFan: {},
		accel: {},
		heat: {},
		wetting: {},
		ozon: {},
		coolerCool: {},
		coolerFlap: {},
		coolerHeat: {},
	},
	acc: {},
}

//
/**
 * Настройки каждого этапа тестирования
 * по code отрабатывается тест из ./def_stage
 * last - длительность теста, кроме теста fan, здесь last время работы одного ВНО,
 * общая длительность теста fan = (кол-во ВНО * last)
 */
const checklist = [
	// { code: 'accel', last: 1 * 60 * 1000, name: 'Разгонные вентиляторы' },
	// { code: 'allFan', last: 1 * 60 * 1000, name: 'Включение всех вентиляторов' },
	// { code: 'fan', last: 60 * 1000, name: 'Включение вентиляторов по очереди' },
	// { code: 'heat', last: 3 * 60 * 1000, name: 'Подогрев клапанов' },
	// { code: 'valve', last: 5 * 60 * 1000, name: 'Откр/закр клапанов' },
	// { code: 'wetting', last: 60 * 1000, name: 'Включение увлажнителей' },
	{ code: 'ozon', last: 5 * 60 * 1000, name: 'Включение озонаторов' },
	// { code: 'coolerCool', last: 60 * 1000 },
	// { code: 'coolerFlap', last: 60 * 1000 },
	// { code: 'coolerHeat', last: 60 * 1000 },
]

module.exports = { initData: JSON.stringify(data), checklist }
