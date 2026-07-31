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
 * Настройки каждого этапа тестирования:
 * code - код теста из ./def_stage/index
 * last - длительность теста для большинаства.
 * 		 Тест fan: last время работы одного ВНО, общая длительность теста fan = (кол-во ВНО * last)
 * name - Название теста
 * type - типы складов, для которых данный тест разрешен
 */
const checklist = [
	{
		code: 'accel',
		last: 1 * 60 * 1000,
		name: 'Разгонные вентиляторы',
		type: ['normal', 'combi', 'cold'],
	},
	{
		code: 'allFan',
		last: 300 * 60 * 1000,
		name: 'Включение всех вентиляторов',
		type: ['normal', 'combi'],
	},
	{
		code: 'fan',
		last: 30 * 1000,
		name: 'Включение вентиляторов по очереди',
		type: ['normal', 'combi'],
	},
	{ code: 'heat', last: 3 * 60 * 1000, name: 'Подогрев клапанов', type: ['normal', 'combi'] },
	{ code: 'valve', last: 5 * 60 * 1000, name: 'Откр/закр клапанов', type: ['normal', 'combi'] },
	{
		code: 'wetting',
		last: 60 * 1000,
		name: 'Включение увлажнителей',
		type: ['normal', 'combi', 'cold'],
	},
	{
		code: 'ozon',
		last: 1 * 60 * 1000,
		name: 'Включение озонаторов',
		type: ['normal', 'combi', 'cold'],
	},
	{
		code: 'coolerCool',
		last: 5 * 1000,
		name: 'Включение испарителей',
		type: ['normal', 'combi', 'cold'],
	},
	{
		code: 'coolerFlap',
		last: 30 * 1000,
		name: 'Включение заслонок испарителей',
		type: ['normal', 'combi', 'cold'],
	},
	{
		code: 'coolerHeat',
		last: 30 * 1000,
		name: 'Включение оттайки испарителей',
		type: ['normal', 'combi', 'cold'],
	},
	{ code: 'co2', last: 30 * 1000, name: 'Удаление СО2', type: ['cold'] },
]

module.exports = { initData: JSON.stringify(data), checklist }
