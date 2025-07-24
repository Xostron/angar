const { compareTime } = require('@tool/command/time')


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

module.exports = checkOn
