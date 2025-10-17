const path = require('path')

const data = {
	// Данные из файла retain, 1. файл читается один раз только при запуске проекта
	// -> 2. далее в каждом цикле в аккумулятор retain записываем данные для сохранения
	// -> 3. затем сохраняем в файл retain -> повтор цикла 2-3
	retain: {},
	// Аккумулятор команд от web -> сохранение в retain
	web: {},
	// Аккумулятор команд от web -> сохранение в retain
	mobile: {},
	// graceful shutdown
	shutdown: false,
	end: false,
	_stableVno: 60_000,
	// Флаг первого цикла
	_first: true,
	// Расчетное время цикла, сек
	_cycle_ms_: 0,
	// Период записи в статистику (датчики), 10 мин
	tStat: 600_000,
	// Прогрев клапанов 60сек
	tWarming: 60,
	// Период повторной проверки модуля, 1мин (sys.tcp)
	tTCP: 410,
	// Антидребезг неисправности модуля ПЛК, 60сек (sys.debplc)
	tDeb: 60_000,
	// Пауза при чтении очередного модуля, мс (sys.pauseplc)
	tPause: 250,
	// 10% от полного времени открытия клапана - время после которого клапан останавливается
	hystV: 10,
	// Антидребезг датчиков, 15 мин (sys.debounce)
	tDebounce: 900_000,
	// Зона нечувствительности между клапанами 2%(sys.deadzone)
	tDeadzone: 2,
	// Web клиент: команды на включение
	command: null,
	// Web клиент: Команды на управление клапанами по времени
	commandT: null,
	// Web клиент: команда калибровки
	tune: null,
	// Web клиент: Склад вкл/выкл
	start: {},
	// Web клиент: Режим работы секции (true - Авто, false - Ручной, null - Выкл)
	mode: {},
	// Время начало цикла
	tick: +new Date().getTime(),
	// Текущие позиции клапанов
	vlvPos: null,
	// Подготовка к авто режиму - Выполнено да/нет
	toAuto: null,
	// Подготовка к ручному режиму - Выполнено да/нет
	toMan: null,
	// Подготовка к выключению секции - Выполнено да/нет
	toOffSection: null,
	// Выключение склада
	toOffBuild: null,
	// Калибровка клапанов: результаты
	tuneTime: null,
	// Команды автоматического режима
	aCmd: null,
	// Cлежение за временем работы периферии (откр/закр клапанов, вкл/выкл вентиляторов )
	watchdog: { softFan: {} },
	// Аккумулятор (Промежуточные данные) - для Авторежим, Доп. функции, Доп. аварии
	acc: {},
	// Аккумулятор (куча) для расчетов (здесь можно хранить всякое)
	heap: { fan: {}, smoking: {} },
	// Аварии клапанов
	alarmV: {},
	// Аварии для логики
	alarm: {
		// Аварии авторежимов
		auto: {},
		// Таймер запретов
		timer: {},
		// Аварии extralrm (доп. аварии)
		extralrm: {},
		// Сообщения extra (доп.функции)
		extra: {},
		//Сообщения авторежима
		achieve: {},
		// Неисправные модули
		module: {},
		// Антидребезг аварий - аварии, которые ожидают (неактивны) заданное время (store.tMdl)
		debounce: {},
	},
	// Выход: сброс аварии (реле безопасности)
	reset: new Set(),
	// Прогрев секции
	warming: {},
	accWarm: {},

	// Данные после анализа
	value: {},
	// Антидребезг аналоговых датчиков - буфер показаний датчиков
	holdSensor: {},
	// Антидребезг аналоговых датчиков - временные метки
	debounce: {},
	// Флаг первого запуска - после первого чтения модулей сбрасывается
	startup: true,
	// Настройки без продукта
	stgWithout: [
		'antibliz',
		'heating',
		'overVlv',
		'accel',
		'idle',
		'co2',
		'ozon',
		'heater',
		'smoking',
	],
	// Время включения и отключения питания Складов idB: {on, off}
	supply: {},
	// Время работы и ожидания окуривания Склада idB: {work, wait}
	smoking: {},
	// Запрет работы холодильника
	denied: {},
	// Неисправные модули
	timeout: {},
	debMdl: {},
	// Прошлые состояния
	prev: { critical: {}, event: {} },
	// Обнулить счетчик сушки
	zero: new Set(),
	// Готовые настройки для алгоритма
	calcSetting: {},
	// Режим получения данных от ЦС (принудительная отправка на админку)
	hub: { init: false, last: false, state: {} },
	// Режим получения данных от ЦС (запросы от админки): Предыдущее состояние
	past: null,
	// Флаги: появилась новая авария, ушла авария (для обновления state )
	// isUpdate: false,
	// Папки
	baseDir: path.join(__dirname, '..'),
	rootDir: path.join(__dirname, '..', '..'),
	pubDir: path.join(process.env.PATH_PUB),
	dataDir: path.join(process.env.PATH_DATA),
	retainDir: path.join(process.env.PATH_RETAIN),
	factoryDir: path.join(process.env.PATH_FACTORY),
	accDir: path.join(process.env.PATH_DATA, 'acc'),
}

// Сссылка на аккумулятор (дополнительные вычисления в auto,extra,extralrm)
function readAcc(buildingId, name, sectionId) {
	data.acc ??= {}
	data.acc[buildingId] ??= {}
	data.acc[buildingId][name] ??= {}
	if (!sectionId) return data.acc[buildingId][name]

	data.acc[buildingId][name][sectionId] ??= {}
	return data.acc[buildingId][name][sectionId]
}

// Установить флаг готовности секции - авто/руч/выкл
function toggleMode(key) {
	return function (obj) {
		// Очистить флаг готовности у всех секций - при выкл. склада
		if (obj?.type === 'delB') {
			delete data[key]?.[obj._build]
			return
		}
		// Установить флаг готовности секции
		data[key] ??= {}
		data[key][obj._build] ??= {}
		data[key][obj._build][obj._section] = obj.value
	}
}

// Установить флаг готовности склада - Пуск-true/стоп-false
function setToOffBuild(obj) {
	// Очистить флаг готовности у склада
	if (obj?.type === 'del') {
		delete data.toOffBuild?.[obj._build]
		return
	}
	// Установить флаг готовности
	data.toOffBuild ??= {}
	data.toOffBuild[obj._build] = obj.value
	// data.toOffBuild = { ...data.toOffBuild, [obj._build]: obj.value }
}

// Начало цикла главной программы
function setTick() {
	data.tick = +new Date().getTime()
}

// Базовая директория проекта
const baseDir = data.baseDir
const pubDir = data.pubDir
const dataDir = data.dataDir
const retainDir = data.retainDir
const factoryDir = data.factoryDir
const rootDir = data.rootDir
const accDir = data.accDir

module.exports = {
	data,
	baseDir,
	pubDir,
	dataDir,
	retainDir,
	factoryDir,
	accDir,

	setTick,
	setToMan: toggleMode('toMan'),
	setToAuto: toggleMode('toAuto'),
	setToOffSection: toggleMode('toOffSection'),
	setToOffBuild,
	readAcc,
}
