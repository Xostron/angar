const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const _MAX = 100

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
function checkOff_Relay(off, acc) {
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
function turnOff(idB, idS, fan, bStart, start) {
	// РАЗРЕШЕНО ВКЛ: команда на окуривание вкл и секция в авто
	console.log(1111, bStart, fan.mode)
	if (start && fan.mode) return false

	// ЗАПРЕЩЕНО ВКЛ и не блокируем ВНО если склад выключен и секция в ручном режиме
	if (!bStart && fan.mode === false) return true
	// Запрещено и выкл ВНО если закончилось окуривание
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

module.exports = { turnOff, turnOn, checkOff_FC, checkOff_Relay, checkOn, regul }
