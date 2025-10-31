const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { data: store } = require('@store')
const ignore = require('./ignore')
const _MAX_SP = 100
const _MIN_SP = 20

/**
 * Выключение ВНО секции
 * @param {*} fans ВНО секции
 * @param {*} bldId Склад Id
 * @param {*} aCmd Команда авто
 * @param {*} acc Аккумулятор плавного пуска
 * @param {*} bdata Результат функции scan()
 * @returns {boolean} true - запрет управления ВНО, false - разрешить управление ВНО
 */
function turnOff(fanFC, fans, solHeat, bld, idS, obj, aCmd, acc, s, bdata, where = 'normal') {
	// Запрет при окуривании
	if (s?.smoking?.on) {
		console.log('\tПлавный пуск: TurnOff (Окуривание)', idS, where)
		return true
	}
	// (КОМБИ) Проверка переключения с НОРМАЛЬНОГО на ХОЛОД и выход
	if (hasToggle(bld, idS, obj, acc, fanFC, fans, solHeat)) {
		console.log('\tПлавный пуск: TurnOff (переключения с НОРМАЛЬНОГО на ХОЛОД)', idS, where)
		return true
	}
	// Игнор работы в комби складе (Работа в НОРМ или ХОЛОД)
	if (ignore[where](bld, obj,s, acc, bdata, solHeat)) {
		console.log('\tПлавный пуск: TurnOff (ИГНОР РАБОТЫ)', idS, where)
		return true
	}
	// Ручной режим -> запрет управления, но ВНО оставляем как есть (aCmd.type=off и секция в ручном)
	if (aCmd.type === 'off' && bdata.mode?.[idS] === false) {
		clear(idS)
		console.log('\tПлавный пуск: TurnOff (Ручной режим)', idS, where)
		return true
	}
	// aCmd - задание на вкл активно
	if (aCmd.type == 'on') {
		console.log('\tПлавный пуск: TurnOff = false -> Разрешить работу ВНО', idS, where)
		return false
	}
	// Задание не активно: Выкл ВНО (aCmd.type == 'off')
	offAll(fanFC, fans, solHeat, bld)
	clear(idS)
	console.log('\tПлавный пуск: TurnOff (По-умолчанию - все выключить)', idS, where)
	return true
}

// ========================================================================
// Отключение ВНО при переключения комби склада с режима НОРМАЛЬНОГО на ХОЛОД
function hasToggle(bld, idS, obj, acc, fanFC, fans, solHeat) {
	if (
		acc.prevMode &&
		acc.prevMode == 'combi_normal' &&
		obj?.value?.building?.[bld._id]?.bldType == 'combi_cold'
	) {
		acc.toggleMode = true
		offAll(fanFC, fans, solHeat, bld)
		clear(idS)
		acc.prevMode = obj?.value?.building?.[bld._id]?.bldType
		return true
	}
	acc.toggleMode = false
	acc.prevMode = obj?.value?.building?.[bld._id]?.bldType
	return false
}

// Очистка аккумулятора
function clear(idS) {
	store.watchdog.softFan[idS].order = undefined
	store.watchdog.softFan[idS].date = undefined
	store.watchdog.softFan[idS].busy = false
	store.watchdog.softFan[idS].fc = undefined
	store.watchdog.softFan[idS].sol = undefined
	store.watchdog.softFan[idS].allStarted = undefined
	// console.log(5553, idS, 'Очистка store.watchdog.softFan')
}

// Секция выключена -> отключение всех узлов
function offAll(fanFC, fans, solHeat, bld) {
	// Выключение всех ВНО (однократно) TODO проверить комбинированный
	// if (acc.order !== -1  || where == 'normal') {
	fans.forEach((f, i) => {
		f?.ao?.id ? ctrlAO(f, bld._id, _MIN_SP) : null
		ctrlDO(f, bld._id, 'off')
	})
	if (fanFC) {
		ctrlAO(fanFC, bld._id, _MIN_SP)
		ctrlDO(fanFC, bld._id, 'off')
	}
	solHeat.forEach((el) => {
		ctrlDO(el, bld._id, 'off')
	})
}

module.exports = turnOff
