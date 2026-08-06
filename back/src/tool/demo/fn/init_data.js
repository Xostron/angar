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
		// valve: {
		// 	name: 'Клапаны',
		// 	list: {},
		// },
		// fan: { name: 'Вентиляторы по очереди', list: {} },
		// allFan: { name: 'Все вентиляторы', list: {} },
		// accel: { name: 'Разгонные вентиляторы', list: {} },
		// heat: { name: 'Обогрев клапанов', list: {} },
		// wetting: { name: 'Увлажнители', list: {} },
		// ozon: { name: 'Озонаторы', list: {} },
		// coolerCool: { name: 'Испаритель - охлаждение', list: {} },
		// coolerFlap: { name: 'Испаритель - жалюзи', list: {} },
		// coolerHeat: { name: 'Испаритель - оттайка', list: {} },
		// co2: { name: 'Удаление СО2', list: {} },
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
		code: 'valve',
		// last: 0.5 * 60 * 1000,
		last: 5 * 60 * 1000,
		name: 'Откр/закр клапанов',
		type: ['normal', 'combi'],
	},
	{
		code: 'fan',
		// last: .5 * 60 * 1000,
		last: 1 * 60 * 1000,
		name: 'Включение вентиляторов по очереди',
		type: ['normal', 'combi'],
	},
	{
		code: 'allFan',
		// last: .5 * 60 * 1000,
		last: 3 * 60 * 1000,
		name: 'Включение всех вентиляторов',
		type: ['normal', 'combi'],
	},
	{
		code: 'heat',
		// last: 0.5 * 60 * 1000,
		last: 3 * 60 * 1000,
		name: 'Подогрев клапанов',
		type: ['normal', 'combi'],
	},
	{
		code: 'accel',
		// last: .5 * 60 * 1000,
		last: 3 * 60 * 1000,
		name: 'Разгонные вентиляторы',
		type: ['normal', 'combi', 'cold'],
	},
	{
		code: 'wetting',
		// last: 0.5 * 60 * 1000,
		last: 3 * 60 * 1000,
		name: 'Включение увлажнителей',
		type: ['normal', 'combi', 'cold'],
	},
	{
		code: 'ozon',
		last: 3 * 60 * 1000,
		name: 'Включение озонаторов',
		type: ['normal', 'combi', 'cold'],
	},
	{
		code: 'co2',
		// last: 0.5 * 60 * 1000,
		last: 3 * 60 * 1000,
		name: 'Удаление СО2',
		type: ['cold'],
	},
	{
		code: 'coolerCool',
		// last: 0.5 * 60 * 1000,
		last: 5 * 60 * 1000,
		name: 'Включение испарителей',
		type: ['combi', 'cold'],
	},
	{
		code: 'coolerFlap',
		// last: 0.5 * 60 * 1000,
		last: 1 * 60 * 1000,
		name: 'Включение жалюзи испарителей',
		type: ['combi', 'cold'],
	},
	{
		code: 'coolerHeat',
		last: 0.5 * 60 * 1000,
		last: 3 * 60 * 1000,
		name: 'Включение оттайки испарителей',
		type: ['combi', 'cold'],
	},
]

module.exports = { initData: JSON.stringify(data), checklist }
