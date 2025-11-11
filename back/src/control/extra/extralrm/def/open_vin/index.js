const { set, reset,  fnCheck } = require('./fn')
/**
 * @description Доп. авария склада: Температура канала выше температуры продукта
 * @param {object} bld Склад
 * @param {undefined} section Секция недоступна для доп аварий склада
 * @param {object} obj Рама
 * @param {object} s Настройки
 * @param {object} seB Датчики склада
 * @param {object} m Периферия склада
 * @param {string} automode авторежим склада
 * @param {object} acc аккумулятор аварии
 * @param {null} data доп. данные (используются секционными доп авариями)
 * @returns {boolean} авария
 */
module.exports = function openVin(bld, section, obj, s, seB, m, automode, acc, data) {
	// Разрешение работы
	if (!fnCheck(bld, obj, s, automode, m, acc)) return false
	// Установка аварии
	set(bld, obj, seB, s, m, acc)
	// Автосброс аварии
	reset(bld, s, acc)
	return acc?._alarm ?? false
}
