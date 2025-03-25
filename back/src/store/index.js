const path = require('path')
const mesTimer = require('@dict/timer_lock')
const { msgM } = require('@tool/message')

const data = {
	// Флаг первого цикла
	_first: true,
	// Расчетное время цикла, сек
	_cycle_ms_: 0,
	// Период записи в статистику (датчики), 10 мин
	tStat: 600_000,
	// Прогрев клапанов 60сек
	tWarming: 60,
	// TCP период повторной проверки модуля, мин(sys.tcp)
	tTCP: 10,
	// Пауза при чтении очередного модуля, мс (sys.pauseplc)
	tPause: 500,
	// 10% от полного времени открытия клапана - время после которого клапан останавливается
	hystV: 10,
	// Антидребезг неисправности модуля ПЛК, 20сек (sys.debplc)
	tDebPlc: 20_000,
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
	watchdog: null,
	// Промежуточные данные - расчеты (Авторежим, Доп. функции, Доп. аварии)
	acc: {},
	// Аккумулятор (куча) для расчетов
	heap: {},
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
	stgWithout: ['antibliz', 'heating', 'overVlv', 'accel', 'idle', 'co2', 'ozon', 'heater', 'smoking'],
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
	// Папки
	baseDir: path.join(__dirname, '..'),
	rootDir: path.join(__dirname, '..', '..'),
	pubDir: path.join(process.env.PATH_PUB),
	dataDir: path.join(process.env.PATH_DATA),
	retainDir: path.join(process.env.PATH_RETAIN),
	factoryDir: path.join(process.env.PATH_FACTORY),
	accDir: path.join(process.env.PATH_DATA, 'acc'),
}

// Обнулить счетчик сушки
function zero(obj, type = true) {
	// обнулить
	if (!type) {
		return data.zero.clear()
	}
	// установить
	data.zero.add(obj.buildingId)
}

function isZero(buildingId) {
	return data.zero.has(buildingId)
}

// Наличие аварии
function isAlr(buildingId, automode) {
	const d = data.alarm.auto?.[buildingId]?.[automode] ?? {}
	return Object.keys(d).length ? true : false
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

// Команда управления
function setACmd(type, sectionId, obj) {
	data.aCmd ??= {}
	data.aCmd[sectionId] ??= {}
	data.aCmd[sectionId][type] ??= {}
	data.aCmd[sectionId][type] = { ...data.aCmd?.[sectionId]?.[type], ...obj }
}
// Калибровочное время клапана
function setTuneTime(obj) {
	if (obj === null) {
		data.tuneTime = null
		return
	}
	data.tuneTime ??= {}
	data.tuneTime[obj._build] ??= {}
	data.tuneTime[obj._build][obj._id] = obj._time
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

// Установить позиции клапанов
function setPos(obj) {
	if (obj === null) {
		data.vlvPos = null
		return
	}
	data.vlvPos ??= {}
	data.vlvPos[obj._build] ??= {}
	data.vlvPos[obj._build][obj._id] = obj.value
}

// Начало цикла главной программы
function setTick() {
	data.tick = +new Date().getTime()
}

// Установить команды управления
function setCmd(obj) {
	if (!obj) {
		data.command = null
		return
	}
	data.command ??= {}
	for (const build in obj) {
		data.command[build] ??= {}
		for (const mdl in obj[build]) {
			data.command[build][mdl] ??= {}
			for (const channel in obj[build][mdl]) {
				const val = obj[build][mdl][channel]
				data.command[build][mdl][channel] = val
			}
		}
	}
}

// Установить команды управления (включение по времени)
function setCmdT(obj) {
	if (!obj) return
	data.commandT ??= {}
	for (const build in obj) {
		data.commandT[build] ??= {}
		for (const mdl in obj[build]) {
			data.commandT[build][mdl] ??= {}
			for (const channel in obj[build][mdl]) {
				const o = obj[build][mdl][channel]
				data.commandT[build][mdl][channel] = o
			}
		}
	}
}

// Установить команды на калибровку клапанов
function setTune(obj) {
	data.tune = { ...data.tune, ...obj }
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
	setCmd,
	setTune,
	setCmdT,
	setTick,
	setPos,
	setToMan: toggleMode('toMan'),
	setToAuto: toggleMode('toAuto'),
	setToOffSection: toggleMode('toOffSection'),
	setToOffBuild,
	setTuneTime,
	setACmd,
	isAlr,
	readAcc,
	zero,
	isZero,
}
