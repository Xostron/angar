const { compareTime } = require('@tool/command/time')
const _MAX_SP = 100
const _MIN_SP = 20

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
function regul(acc, fanFC, on, off, s, aCmd, max, isCC) {
	if (aCmd.force && (max === null || max === -1)) return false
	if (!fanFC) return false
	// Авария Антидребезг ВНО - разрешаем регулировать по кол-ву ВНО
	if (acc.stable) return false
	// Акутализируем точку отсчета для реле ВНО, пока регулирование по ПЧ
	if (acc.busy) acc.date = new Date()
	// Пошагово увеличиваем задание ПЧ
	if (on) {
		acc.fc.value = true
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		// Задание ПЧ дошло до 100% => разрешаем регулировать по кол-ву ВНО
		if (acc.fc.sp >= _MAX_SP) return false
		const time = compareTime(acc.fc.date, acc.delayFC)
		// Время шага ПЧ не прошло -> выходим
		if (!time) return true
		// Время шага прошло -> увеличиваем частоту
		// Время стабилизации прошло
		acc.fc.sp += s.fan.step
		// Ограничение max задания ПЧ
		acc.fc.sp = acc.fc.sp > _MAX_SP ? _MAX_SP : acc.fc.sp
		// Ограничение min задания ПЧ
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		acc.fc.date = new Date()
	}

	// Пошагово уменьшаем задание ПЧ
	if (off) {
		acc.fc.value = true
		if (magic(acc, isCC)) return false
		// Задание ПЧ дошло до min% && не все ВНО выкл  => разрешаем регулировать по кол-ву ВНО
		if (acc.fc.sp <= s.fan.min && acc.order >= 0) {
			acc.fc.sp = s.fan.min
			// // Частоту ПЧ обратно увеличиваем на 100%, а ВНО релейное - отключаем
			// acc.fc.sp = 100
			// console.log(1122, acc.fc)
			return false
		}
		// Ждем
		if (!compareTime(acc.fc.date, acc.delayFC)) {
			// console.log(1123, 'ждем',acc.fc)
			return true
		}
		// Время стабилизации прошло
		acc.fc.sp -= s.fan.step
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		acc.fc.date = new Date()
		// console.log(1124, acc.fc)
	}
	acc.fc.date = new Date()
	// console.log(1125, acc.fc)
	return true
}

// Комби-холод. Обычное управление: Отключение ПЧ, если все релейные ВНО выключены и задание ПЧ < min
function magic(acc, isCC) {
	// Комби-холод
	// console.log(1121, isCC, acc.order, acc.fc.sp, '<=', _MIN_SP)
	if (isCC && acc.order === -1 && acc.fc.sp <= _MIN_SP) {
		acc.fc.sp = _MIN_SP
		acc.fc.value = false
		acc.fc.date = new Date()
		return true
	}
	// Обычный, комби-обычный
	return false
}

module.exports = regul
