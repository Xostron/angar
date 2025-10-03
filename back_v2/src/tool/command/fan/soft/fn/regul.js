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
function regul(acc, fanFC, on, off, s, where) {
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
		if (acc.fc.sp >= _MAX) return false
		if (!compareTime(acc.fc.date, acc.delayFC)) return true

		// Время стабилизации прошло
		acc.fc.sp += s.fan.step
		// Ограничение max задания ПЧ
		acc.fc.sp = acc.fc.sp > _MAX ? _MAX : acc.fc.sp
		// Ограничение min задания ПЧ
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		acc.fc.date = new Date()
		console.log(5558, acc)
	}

	// Пошагово уменьшаем задание ПЧ
	if (off) {
		acc.fc.value = true
		if (magic(acc, s, where)) return true
		// Задание ПЧ дошло до min% && не все ВНО выкл  => разрешаем регулировать по кол-ву ВНО
		if (acc.fc.sp <= s.fan.min && acc.order >= 0) {
			acc.fc.sp = s.fan.min
			// // Частоту ПЧ обратно увеличиваем на 100%, а ВНО релейное - отключаем
			// acc.fc.sp = 100
			return false
		}
		// Ждем
		if (!compareTime(acc.fc.date, acc.delayFC)) return true
		// Время стабилизации прошло
		acc.fc.sp -= s.fan.step
		if (magic(acc, s, where)) return true
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		acc.fc.date = new Date()
	}
	acc.fc.date = new Date()
	return true
}

// Отключение ПЧ, если все релейные ВНО выключены и задание ПЧ < min
function magic(acc, s, where) {
	if (where == 'cold' && acc.order === -1 && acc.fc.sp < s.fan.min) {
		acc.fc.sp = 0
		acc.fc.value = false
		acc.fc.date = new Date()
		return true
	}
	return false
}

module.exports = regul
