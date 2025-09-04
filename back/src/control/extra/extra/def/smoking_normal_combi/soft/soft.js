const { data: store } = require('@store')
const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const _MAX = 100
/**
 * Плавный пуск ВНО в секции на контакторах
 * @param {string} bldId Id склада
 * @param {string} idS Id секции
 * @param {object} obj Глобальные данные склада
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {object[]} fans Информация по ВНО
 * @param {object} s Настройки склада
 * @param {object} seB Датчики склада (на всякий случай)
 * @param {number} номер секции
 * @returns
 */
function relay(idB, idS, fan, obj, s, se, start) {
	// Аккумулятор
	store.heap.smoking ??= {}
	store.heap.smoking[idS] ??= {}
	const acc = store.heap.smoking[idS]
	// Точка отсчета вкл/выкл ВНО
	acc.date ??= new Date()
	acc.busy ??= false
	// Номер текущего ВНО
	acc.order ??= 0
	// Задание главного ВНО с ПЧ
	acc.fc = undefined
	acc.delayFC = s.fan.next * 1000
	acc.delayRelay = s.fan.delay * 1000 //+ _RAMP
	// ****************** ВЫКЛ ВНО (команда || секция не в авто) ******************
	turnOff(idB, idS, fan, start)

	// ****************** ВКЛ ВНО ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	const { p } = se
	let on = p < s.fan.pressure.p - s.fan.hysteresisP
	let off = p > s.fan.pressure.p + s.fan.hysteresisP
	console.log(2, idS, 'ПП: давление', 'on=', on, 'off=', off)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, fan.fans.length)
	checkOff_FC(off, acc)
	// ВКЛ
	turnOn(fan, idB, acc)
	console.log(3, idS)
}

/**
 *
 * @param {*} idB Id склада
 * @param {*} idS Id секции
 * @param {*} fan {fanFC,fans,type,mode}
 * @param {*} obj Глобальные данные
 * @param {*} s Настройки
 * @param {*} se Датчики секции
 * @param {*} start Команда вкл/выкл
 * @returns
 */
function fc(idB, idS, fan, obj, s, se, start) {
	// Аккумулятор
	store.heap.smoking ??= {}
	store.heap.smoking[idS] ??= {}
	const acc = store.heap.smoking[idS]
	acc.date ??= new Date()
	acc.busy ??= false
	// Номер текущего ВНО
	acc.order ??= -1
	// Задание главного ВНО с ПЧ
	acc.fc ??= {}
	acc.fc.value ??= false
	acc.fc.sp ??= 0
	acc.fc.date ??= new Date()
	acc.delayFC = s.fan.next * 1000
	acc.delayRelay = s.fan.delay * 1000 //+ _RAMP
	// ****************** ВЫКЛ ВНО (команда || секция не в авто) ******************
	turnOff(idB, idS, fan, start)
	// ****************** ВКЛ ВНО ******************
	// Проверка давления в канале (сигнал на вкл/откл вентиляторов)
	const { p } = se
	let on = p < s.fan.pressure.p - s.fan.hysteresisP
	let off = p > s.fan.pressure.p + s.fan.hysteresisP
	console.log(2, idS, 'ПП: давление', 'on=', on, 'off=', off)

	// Регулирование по ПЧ после ожидания соленоида подогрева
	acc.busy = regul(acc, fan.fanFC, on, off, s)
	if (acc.busy) (on = false), (off = false)
	console.log(3, idS, 'ПП', 'on=', on, 'off=', off)
	// Управление очередью вкл|выкл вентиляторов
	checkOn(on, acc, fan.fans.length)
	checkOff_FC(off, acc)
	// ВКЛ
	turnOn(fan, idB, acc)
}

module.exports = { fc, relay }

/**
 * Регулирование ПЧ (Аналоговый выход ВНО)
 * @param {object} acc аккумулятор
 * @param {object} fanFC команда авто
 * @param {boolean} on сигнал на повышение давления
 * @param {boolean} off сигнал на понижение давления
 * @param {object} s настройки
 * @returns {boolean} acc.busy - Флаг регулирование частоты
 * true: Регулирование частоты текущего (acc.order) ВНО,
 * false: Регулирование по кол-ву ВНО
 */
function regul(acc, fanFC, on, off, s) {
	if (!fanFC) return false
	// Актализируем точку отсчета для реле ВНО, пока регулирование по ПЧ
	if (acc.busy) acc.date = new Date()
	// Пошагово увеличиваем задание ПЧ
	if (on) {
		acc.fc.value = true
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		// Задание ПЧ дошло до 100% => разрешаем регулировать по кол-ву ВНО
		if (acc.fc.sp >= _MAX) return false
		if (!compareTime(acc.fc.date, acc.delayFC)) return true

		// Время стабилизации прошло
		acc.fc.sp += s.fan.step
		// Ограничение max задания ПЧ
		acc.fc.sp = acc.fc.sp > _MAX ? _MAX : acc.fc.sp
		// Ограничение min задания ПЧ
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		acc.fc.date = new Date()
	}

	// Пошагово уменьшаем задание ПЧ
	if (off) {
		acc.fc.value = true
		// Задание ПЧ дошло до min% && не все ВНО выкл  => разрешаем регулировать по кол-ву ВНО
		if (acc.fc.sp <= s.fan.min && acc.order >= 0) {
			acc.fc.sp = s.fan.min
			return false
		}
		// Ждем
		if (!compareTime(acc.fc.date, acc.delayFC)) return true
		// Время стабилизации прошло
		acc.fc.sp -= s.fan.step
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		acc.fc.date = new Date()
	}
	acc.fc.date = new Date()
	return true
}

/**
 * Логика плавного пуска ВНО (реле)
 * @param {boolean} on Давление в канала меньше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {number} length Кол-во вентиляторов в секции
 * @returns
 */
function checkOn(on, acc, length) {
	if (!on) return
	// Проверка времени (время на стабилизацию давления в канале, после drk DYJ)
	if (!compareTime(acc.date, acc.delayRelay)) return
	// Включаем следующий ВНО
	if (++acc.order >= length - 1) {
		acc.order = length - 1
		return
	}
	// Новая точка отсчета
	acc.date = new Date()
}

/**
 * Последовательное выключение - ПЧ Схема
 * @param {boolean} off Давление в канале выше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Авто - команда на вкл/выкл ВНО
 * @returns
 */
function checkOff_FC(off, acc) {
	if (!off) return
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	if (!compareTime(acc.date, acc.delayRelay)) return
	// Выкл следующего ВНО
	if (--acc.order <= -1) {
		acc.order = -1
		return
	}
	// Обновление точки отсчета
	acc.date = new Date()
}

// Последовательное выключение - Релейная схема
function CheckOff_Relay(off, acc) {
	if (!off) return
	// Проверка времени (время на стабилизацию давления/темп в канале, после выкл ВНО)
	if (!compareTime(acc.date, acc.delayRelay)) {
		return
	}
	// Выкл следующего ВНО
	if (--acc.order <= 0) {
		acc.order = 0
		return
	}
	// Обновление точки отсчета
	acc.date = new Date()
}

/**
 * Включение ВНО по порядку
 * @param {*} fans ВНО секции
 * @param {*} idB Склад Id
 * @param {*} acc Аккумулятор
 */
function turnOn(fan, idB, acc) {
	if (fan.fanFC) {
		ctrlAO(fan.fanFC, idB, acc.fc.sp)
		ctrlDO(fan.fanFC, idB, acc.fc.value ? 'on' : 'off')
	}
	fan.fans.forEach((f, i) => {
		// Очередь не дошла - выключить ВНО
		if (acc.order < i) {
			ctrlDO(f, idB, 'off')
			f?.ao?.id ? ctrlAO(f, idB, 0) : null
			return
		}
		// Включить ВНО
		ctrlDO(f, idB, 'on')
		f?.ao?.id ? ctrlAO(f, idB, 100) : null
	})
}

/**
 * Выключение ВНО секции
 * @param {*} fans ВНО секции
 * @param {*} bldId Склад Id
 * @param {*} aCmd Команда авто
 * @param {*} acc Аккумулятор плавного пуска
 * @param {*} bdata Результат функции scan()
 * @returns {boolean} true - запрет управления ВНО, false - разрешить управление ВНО
 */
function turnOff(idB, idS, fan, start) {
	// РАЗРЕШЕНО ВКЛ
	if (start && fan.mode) return false
	// ЗАПРЕЩЕНО ВКЛ
	console.log(1, idS, 'ПП: Выключение ВНО')
	fan.fans.forEach((f, i) => {
		f?.ao?.id ? ctrlAO(f, idB, 0) : null
		ctrlDO(f, idB, 'off')
	})
	if (fan.fanFC) {
		ctrlAO(fan.fanFC, idB, 0)
		ctrlDO(fan.fanFC, idB, 'off')
	}
	return true
}
