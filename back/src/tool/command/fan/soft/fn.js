const { ctrlAO, ctrlDO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')
const _RAMP = 5000
const _MAX = 100
const { isAlr } = require('@tool/message/auto')
const { sensor } = require('@tool/command/sensor')
/**
 * Логика плавного пуска ВНО
 * @param {boolean} on Давление в канала меньше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {number} length Кол-во вентиляторов в секции
 * @returns
 */
function checkOn(on, acc, aCmd, length) {
	if (!on) return
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	// TODO для комбинированного склада увеличенное время?
	const time = aCmd.delay + _RAMP
	if (!compareTime(acc.date, time)) {
		// console.log(555, `Ожидайте пока выровнится давление после вкл ВНО`, time)
		return
	}
	// Включаем следующий ВНО
	if (++acc.order >= length - 1) {
		acc.order = length - 1
		return
	}
	// Новая точка отсчета
	acc.date = new Date()
	console.log(111, 'Вкл ВНО и фиксирую новое время', acc.date)
}

/**
 * Логика плавного останова ВНО
 * @param {boolean} off Давление в канале выше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Авто - команда на вкл/выкл ВНО
 * @returns
 */
function checkOff(off, acc, aCmd) {
	if (!off) return
	const time = aCmd.delay
	// Проверка времени (время на стабилизацию давления в канале, после подключения вентилятора)
	if (!compareTime(acc.date, time)) {
		// console.log(22, `Ожидайте пока выровнится давление после откл ВНО`)
		return
	}
	if (--acc.order <= 0) {
		acc.order = 0
		return
	}
	acc.date = new Date()
	console.log(222, 'Выкл ВНО и фиксирую новое время', acc.date)
}

/**
 * Регулирование ПЧ (Аналоговый выход ВНО)
 * @param {object} acc аккумулятор
 * @param {object} aCmd команда авто
 * @param {boolean} on сигнал на повышение давления
 * @param {boolean} off сигнал на понижение давления
 * @param {object} s настройки
 * @returns {boolean} acc.busy - Флаг регулирование частоты
 * true: Регулирование частоты текущего (acc.order) ВНО,
 * false: Регулирование по кол-ву ВНО
 */
function regul(acc, fans, on, off, s) {
	// Какой ВНО сейчас на очереди: без ПЧ
	const fan = fans[acc.order]
	if (!fan?.ao?.id) return false

	// С ПЧ
	// Авария Антидребезг ВНО - разрешаем регулировать по кол-ву ВНО
	if (acc.stable) return false
	// Время ожидания следующего шага
	// TODO для комбинированного склада увеличенное время?
	const time = s.fan.next * 1000
	// Пошагово увеличиваем задание ПЧ
	if (on) {
		// Задание ПЧ дошло до 100% => разрешаем регулировать по кол-ву ВНО
		if (acc.fc?.[fan._id] >= _MAX) return false

		// Ждем стабилизации
		if (!acc.fc?.date) acc.fc.date = new Date()
		if (!compareTime(acc.fc.date, time)) return true

		// Время стабилизации прошло
		acc.fc[fan._id] += s.fan.step
		// Ограничение max задания ПЧ
		acc.fc[fan._id] = acc.fc[fan._id] > _MAX ? _MAX : acc.fc[fan._id]
		// Ограничение min задания ПЧ
		acc.fc[fan._id] = acc.fc[fan._id] < s.fan.min ? s.fan.min : acc.fc[fan._id]
		acc.fc.date = new Date()
	}

	// Пошагово уменьшаем задание ПЧ
	if (off) {
		// Задание ПЧ дошло до 0% &&   => разрешаем регулировать по кол-ву ВНО
		if (acc.fc?.[fan._id] <= s.fan.min && acc.order !== 0) return false
		if (acc.fc?.[fan._id] <= s.fan.min && acc.order === 0) return true

		// Ждем стабилизации
		if (!acc.fc.date) acc.fc.date = new Date()
		if (!compareTime(acc.fc.date, time)) return true

		// Время стабилизации прошло
		acc.fc[fan._id] -= s.fan.step
		acc.fc[fan._id] = acc.fc[fan._id] < s.fan.min ? s.fan.min : acc.fc[fan._id]
		acc.fc.date = new Date()
	}
	return true
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
function turnOff(fans, bld, aCmd, acc, bdata, where = 'normal') {
	const r = ignore[where](bld, acc, bdata, where)
	if (r) {
		console.log(99002, where, 'Запрет ВНО, на вкл и выкл')
		return true
	}

	if (aCmd.type !== 'off' || !aCmd.type) {
		console.log(99003, where, 'Запрет ВНО, но разрешаем вкл')
		return false
	}
	// Сброс аккумулятора
	store.watchdog.softFan = {}
	fans.forEach((f, i) => {
		f?.ao?.id ? ctrlAO(f, bld._id, 0) : null
		ctrlDO(f, bld._id, 'off')
	})
	console.log(99004, where, 'Запрет ВНО, но выключаем')
	return true
}

/**
 * Для комбинированного склада: игнорировать управление ВНО
 * при переходе из обычного в холодильный режим
 * @param {*} bld Склад
 * @param {*} acc Аккумулятор плавного пуска
 * @param {*} bdata Результат функции scan()
 * @returns false - разрешить управление, true - запрет управления
 */
function normal(bld, acc, bdata, where) {
	if (bld.type == 'normal' || bdata.automode != 'cooling') return false
	const alrAuto = isAlr(bld._id, bdata.automode)
	return alrAuto
}
function cold(bld, acc, bdata, where) {
	// Проверка перехода из обычного в холодильный режим
	const alrAuto = isAlr(bld._id, bdata.automode)
	return !alrAuto
}
const ignore = {
	normal,
	cold,
}

/**
 * Включение ВНО по порядку
 * @param {*} fans ВНО секции
 * @param {*} bldId Склад Id
 * @param {*} acc Аккумулятор
 */
function turnOn(fans, bldId, acc) {
	fans.forEach((f, i) => {
		// Очередь не дошла - выключить ВНО
		if (acc.order < i) {
			ctrlDO(f, bldId, 'off')
			f?.ao?.id ? ctrlAO(f, bldId, 0) : null
			return
		}
		// Включить ВНО
		ctrlDO(f, bldId, 'on')
		f?.ao?.id ? ctrlAO(f, bldId, acc?.fc?.[f._id]) : null
	})
}

/**
 * Инициализация аккумулятора для управления ВНО
 * acc.order - номер текущего ВНО (от 0 до n) (мин кол-во включенных ВНО = 1)
 * Изменяя данное число, регулируем порядком вкл/выкл вентиляторов
 * для поддержания давления в канале
 * @param {object[]} fans ВНО секции допущенные к управлению
 * @param {string} secId id секции
 * @returns {object} Аккумулятор секции
 */
function init(fans, secId) {
	store.watchdog.softFan[secId] ??= {}
	const a = store.watchdog.softFan[secId]
	// Номер текущего ВНО
	a.order ??= 0
	// Точка отсчета
	a.date ??= new Date()
	// true - регулирование по ПЧ, false - регулирование по кол-ву ВНО
	a.busy ??= false
	// Задание ПЧ
	a.fc ??= {}
	fans.forEach((el) => {
		if (!el.ao) return
		a.fc[el._id] ??= 0
	})
	// a.fc.value ??= 10
	return a
}

const defOnOff = {
	normal: (idB, idS, accAuto, obj, seS, s) => {
		const { p } = sensor(idB, idS, obj)
		let on = p < s.fan.pressure.p - s.fan.hysteresisP
		let off = p > s.fan.pressure.p + s.fan.hysteresisP
		return { on, off }
	},
	cold: (idB, idS, accAuto, obj, seS, s) => {
		let on = seS.tcnl < accAuto.cold.tgtTcnl - s.cooling.hysteresisIn
		let off = seS.tcnl > accAuto.cold.tgtTcnl
		return { on, off }
	},
}
module.exports = { checkOn, checkOff, regul, turnOn, turnOff, init, defOnOff }
