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
function regul(acc, fanFC, on, off, s) {
	if (!fanFC) return false
	// Авария Антидребезг ВНО - разрешаем регулировать по кол-ву ВНО
	if (acc.stable) return false
	// Время ожидания следующего шага
	let time = s.fan.next * 1000
	// Пошагово увеличиваем задание ПЧ
	if (on) {
		// Задание ПЧ дошло до 100% => разрешаем регулировать по кол-ву ВНО
		if (acc.fc >= _MAX) return false

		// Ждем стабилизации
		if (!acc?.date) {
			acc.date = new Date()
			time = 50
		}
		if (!compareTime(acc.date, time)) return true
		// Время стабилизации прошло
		acc.fc += s.fan.step
		// Ограничение max задания ПЧ
		acc.fc = acc.fc > _MAX ? _MAX : acc.fc
		// Ограничение min задания ПЧ
		acc.fc = acc.fc < s.fan.min ? s.fan.min : acc.fc
		acc.date = new Date()
	}

	// Пошагово уменьшаем задание ПЧ
	if (off) {
		// Задание ПЧ дошло до 0% &&   => разрешаем регулировать по кол-ву ВНО
		if (acc.fc <= s.fan.min) return false
		// if (acc.fc <= s.fan.min && acc.order === 0) {
		// 	acc.fc = s.fan.min
		// 	return true
		// }
		// Ждем стабилизации
		if (!acc.date) acc.date = new Date()
		if (!compareTime(acc.date, time)) return true
		// Время стабилизации прошло
		acc.fc -= s.fan.step
		acc.fc = acc.fc < s.fan.min ? s.fan.min : acc.fc
		acc.date = new Date()
	}
	return true
}

module.exports = regul
