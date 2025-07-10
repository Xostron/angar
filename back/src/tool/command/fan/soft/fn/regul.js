const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')
const _MAX = 100
const { sensor } = require('@tool/command/sensor')

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
function regul(acc, fanFC, on, off, s, where) {
	if (!fanFC) return false
	// Авария Антидребезг ВНО - разрешаем регулировать по кол-ву ВНО
	if (acc.stable) return false
	// Время ожидания следующего шага
	let time = s.fan.next * 1000
	// Пошагово увеличиваем задание ПЧ
	if (on) {
		acc.fc.value = true
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		// Задание ПЧ дошло до 100% => разрешаем регулировать по кол-ву ВНО
		if (acc.fc.sp >= _MAX) return false
		if (!compareTime(acc.fc.date, time)) return true
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
		if (where == 'cold' && acc.order === -1 && acc.fc.sp < s.fan.min) {
			acc.fc.sp = 0
			acc.fc.value = false
			acc.fc.date=new Date()
			return true
		}
		// Задание ПЧ дошло до 0% &&   => разрешаем регулировать по кол-ву ВНО
		if (acc.fc.sp <= s.fan.min && acc.order >= 0) {
			acc.fc.sp = s.fan.min
			return false
		}
		if (!compareTime(acc.fc.date, time)) return true
		// Время стабилизации прошло
		acc.fc.sp -= s.fan.step
		if (where == 'cold' && acc.order === -1 && acc.fc.sp < s.fan.min) {
			acc.fc.sp = 0
			acc.fc.value = false
			acc.fc.date=new Date()
			return true
		}
		acc.fc.sp = acc.fc.sp < s.fan.min ? s.fan.min : acc.fc.sp
		acc.fc.date = new Date()
	}
	acc.fc.date=new Date()
	return true
}

module.exports = regul
