const path = require('path')
const mesTimer = require('@dict/timer_lock')

const data = {
	_cycle_ms_: 0,
	// Добавочная задержка главного цикла
	tDelay: 0,
	// Прогрев клапанов 60сек
	tWarming: 60,
	// TCP период повторной проверки модуля - каждую 1 мин
	tTCP: 1,
	// Пауза при чтении очередного модуля, мс
	tPause: 500,
	// 10% от полного времени открытия клапана - время после которого клапан останавливается
	hystV: 10,
	baseDir: path.join(__dirname, '..'),
	rootDir: path.join(__dirname, '..', '..'),
	pubDir: path.join(process.env.PATH_PUB),
	dataDir: path.join(process.env.PATH_DATA),
	retainDir: path.join(process.env.PATH_RETAIN),
	factoryDir: path.join(process.env.PATH_FACTORY),
	tracingDir: path.join(process.env.PATH_DATA, 'tracing'),
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
	acc: null,
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
	// Неисправные модули
	errMdl: {},
	timeout: {},
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
	// Моточасы
	engineHour: {},
}
// Разрешить/заблокировать опрос модуля
function timeout(buildingId, moduleId, ip, el) {
	// Модуль исправен - разрешить опрос

	if (!isErrM(buildingId, moduleId)) return true

	// Поставить неисправный модуль в ожидание
	// Время ожидания опроса
	const _TIME = data.tTCP * 60 * 1000
	const now = new Date().getTime()
	if (!data.timeout?.[moduleId]) data.timeout[moduleId] = now + _TIME

	// Время не прошло - блокировать опрос модуля
	if (now <= data.timeout?.[moduleId]) {
		console.log('Блокировать модуль', el?.name, el?.use, ip)
		return false
	}

	data.timeout[moduleId] = new Date().getTime() + _TIME
	console.log('Разрешить опрос', el?.name, el?.use, ip)
	// Время прошло - разрешить опрос
	return true
}

// Проверка внесен ли модуль в список неисправных
function isErrM(buildingId, moduleId) {
	return !!data.alarm.module?.[buildingId]?.[moduleId]
}

// Сохранить неисправный модуль в список аварий
function wrModule(buildingId, moduleId, o) {
	data.alarm.module[buildingId] ??= {}
	data.alarm.module[buildingId][moduleId] = o
}

// Удалить модуль из списка аварий
function delModule(buildingId, moduleId) {
	if (!moduleId) {
		delete data.alarm.module?.[buildingId]
		return
	}
	delete data.alarm.module?.[buildingId]?.[moduleId]
}

// Сброс аварий - установить/обнулить
function reset(obj, type = true) {
	// обнулить
	if (!type) data.reset.clear()
	// установить
	data.reset.add(obj.buildingId)
}
// Наличие: Сброс аварии на данном складе
function isReset(buildingId) {
	return data.reset.has(buildingId)
}
// Записать в extra событие
function wrExtra(buildingId, sectionId, name, o) {
	data.alarm.extra ??= {}
	data.alarm.extra[buildingId] ??= {}
	if (!sectionId) {
		data.alarm.extra[buildingId][name] = o
		return
	}
	data.alarm.extra[buildingId][sectionId] ??= {}
	data.alarm.extra[buildingId][sectionId][name] = o
}
// Записать в extra событие
function delExtra(buildingId, sectionId, name) {
	if (!sectionId) {
		delete data.alarm?.extra?.[buildingId]?.[name]
		return
	}
	delete data.alarm?.extra?.[buildingId]?.[sectionId]?.[name]
}

// Получить extralrm аварию
function isExtralrm(buildingId, sectionId, name) {
	if (!sectionId) {
		return !!data.alarm?.extralrm?.[buildingId]?.[name]
	}
	return !!data.alarm?.extralrm?.[buildingId]?.[sectionId]?.[name]
}
// Записать в extralrm (доп. аварии)
function wrExtralrm(buildingId, sectionId, name, o) {
	data.alarm.extralrm ??= {}
	data.alarm.extralrm[buildingId] ??= {}
	if (!sectionId) {
		data.alarm.extralrm[buildingId][name] = o
		return
	}
	data.alarm.extralrm[buildingId][sectionId] ??= {}
	data.alarm.extralrm[buildingId][sectionId][name] = o
}
// Удалить из extralrm (доп. аварии)
function delExtralrm(buildingId, sectionId, name, id) {
	if (!sectionId) {
		delete data.alarm?.extralrm?.[buildingId]?.[name]
		return
	}
	if (!id) {
		delete data.alarm?.extralrm?.[buildingId]?.[sectionId]?.[name]
		return
	}
	delete data.alarm?.extralrm?.[buildingId]?.[sectionId]?.[name]?.[id]
}

// Записать в achieve (доп. функции)
function wrAchieve(buildingId, name, o) {
	data.alarm.achieve ??= {}
	data.alarm.achieve[buildingId] ??= {}
	data.alarm.achieve[buildingId][name] ??= {}
	data.alarm.achieve[buildingId][name][o.code] = o
}
// Удалить из extralrm (доп. аварии)
function delAchieve(buildingId, name, code) {
	delete data?.alarm?.achieve?.[buildingId]?.[name]?.[code]
}

// Записать в Таймеры запретов
function wrTimer(buildingId, key, name) {
	// data.alarm ??= {}
	data.alarm.timer ??= {}
	data.alarm.timer[buildingId] ??= {}
	data.alarm.timer[buildingId][key] = mesTimer.get(name, key)
}
// Удалить из Таймеров запретов
function delTimer(buildingId, key) {
	delete data.alarm.timer?.[buildingId]?.[key]
}

/**
 * rs-триггер (приоритет на сброс)
 * @param {*} buildingId
 * @param {*} sectionId
 * @param {*} automode
 * @param {*} arr {id код аварии, set условие установки аварии, reset условие сброса аварии, msg текст аварии}
 */
function rs(buildingId, sectionId, automode, arr) {
	// data.alarm ??= {}
	data.alarm.auto ??= {}
	data.alarm.auto[buildingId] ??= {}
	data.alarm.auto[buildingId][automode] ??= {}
	data.alarm.auto[buildingId][automode][sectionId] ??= {}
	if (!arr?.length) return

	const d = data?.alarm?.auto?.[buildingId]?.[automode]?.[sectionId]

	arr.forEach((o, idx) => {
		let r = null
		if (o.set && !d?.[o.msg.code]) d[o.msg.code] = { id: idx, date: new Date(), ...o.msg }
		if (o.reset) delete d[o.msg.code]
		// d[o.msg.code] = r
	})
}
// Наличие аварии
function isAlr(buildingId, sectionId, automode) {
	const d = data.alarm.auto?.[buildingId]?.[automode]?.[sectionId] ?? {}
	return Object.keys(d).length ? true : false
}

// Сссылка на аккумулятор (дополнительные вычисления в auto,extra,extralrm)
function readAcc(buildingId, name, sectionId) {
	data.acc ??= {}
	data.acc[buildingId] ??= {}
	data.acc[buildingId][name] ??= {}
	if (!sectionId) return data.acc?.[buildingId]?.[name]

	data.acc[buildingId][name][sectionId] ??= {}
	return data.acc?.[buildingId]?.[name]?.[sectionId]
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
const tracingDir = data.tracingDir

module.exports = {
	data,
	baseDir,
	pubDir,
	dataDir,
	retainDir,
	factoryDir,
	tracingDir,
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
	rs,
	isAlr,
	readAcc,

	wrTimer,
	delTimer,

	wrExtralrm,
	delExtralrm,

	wrAchieve,
	delAchieve,

	isExtralrm,
	reset,
	isReset,
	wrExtra,
	delExtra,

	wrModule,
	delModule,
	isErrM,
	timeout,
}
