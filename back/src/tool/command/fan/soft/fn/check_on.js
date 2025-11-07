const { compareTime } = require('@tool/command/time')

/**
 * Логика плавного пуска ВНО (для релейных ВНО)
 * @param {boolean} on Давление в канала меньше задания
 * @param {object} acc Аккумулятор
 * @param {object} aCmd Команда авторежима на вкл/выкл ВНО
 * @param {number} length Кол-во вентиляторов в секции
 * @returns
 */
function checkOn(on, acc, s, length) {
	if (!on) {
		// console.log('\tCheckON: (on=false) кол-во работающих ВНО => без изменений')
		return
	}
	// Проверка времени (время на стабилизацию давления в канале, после вкл ВНО)
	if (!compareTime(acc.date, acc.delayRelay)) {
		// console.log(
		// 	'\tCheckON: (on=true) кол-во работающих ВНО => Ожидание',
		// 	acc.delayRelay / 1000,
		// 	'сек'
		// )
		return
	}
	// Частоту ПЧ уменьшаем до мин частоты s.fan., а ВНО релейное - отключаем
	if (acc.order < length - 1) acc.fc.sp = s.fan.min
	// Включаем следующий ВНО
	if (++acc.order >= length - 1) {
		acc.order = length - 1
		// console.log('\tCheckON: (on=true) кол-во работающих ВНО => достигло МАКС')
		return
	}
	// Новая точка отсчета
	acc.date = new Date()
	// console.log('\tCheckON: (on=true) кол-во работающих ВНО => увеличиваем +1 ВНО')
}

module.exports = checkOn
