const { fnACmd, fnFanWarm } = require('./fn')
const soft = require('./soft')

/**
 * Обычный склад и Комбинированный склад в обычном режиме
 * Для секций в авторежиме: если у одной секции формируется сигнал на
 * включение вент (2я секция в авторежиме - вент остановлены),
 * включается вентиляторы на всех секциях в авторежиме
 * @param {string} bld Cклад
 * @param {object} resultFan Задание на включение ВНО
 * @param {object} s Настройки склада
 * @param {object} obj Глобальные данные склада
 * @param {object} bdata Результат функции scan()
 */
function normal(bld, obj, s, seB, seS, m, resultFan, bdata) {
	console.log(999001, 'soft режим норм')
	const start = resultFan.start.includes(true)
	// Формирование aCmd: команда авторежима на вкл/выкл ВНО
	fnACmd(bld._id, resultFan, s, start)
	// Формирование aCmd: Прогрев клапанов
	if (!start) fnFanWarm(resultFan, s)
	// Плавный пуск/стоп ВНО склада
	soft(bld, obj, s, seB, seS, m, resultFan, bdata, 'normal')
}

// Комбинированный склад в холодильном режиме
function combi(bld, obj, s, seB, seS, m, resultFan, bdata) {
	console.log(999001, 'soft режим холода')

	const start = resultFan.start.includes(true)
	// Формирование aCmd: команда авторежима на вкл/выкл ВНО
	fnACmd(bld._id, resultFan, s, start)
	// Плавный пуск/стоп ВНО склада
	soft(bld, obj, s, seB, seS, m, resultFan, bdata, 'cold')
}

module.exports = {
	normal,
	combi,
}
