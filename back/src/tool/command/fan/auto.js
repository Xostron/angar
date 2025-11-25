const { fnACmd, fnFanWarm } = require('./fn')
const soft = require('./soft')

/**
 * Обычный склад и Комбинированный склад в обычном режиме
 * @param {string} bld Cклад
 * @param {object} resultFan Задание на включение ВНО
 * @param {object} s Настройки склада
 * @param {object} obj Глобальные данные склада
 * @param {object} bdata Результат функции scan()
 */
function normal(bld, obj, s, seB, m, resultFan, bdata) {
	console.log(11, 'SOFT_COMBI_NORMAL', bld.name)
	const start = resultFan.start.includes(true)
	// Формирование aCmd: команда авторежима на вкл/выкл ВНО
	fnACmd(bld, resultFan, start, obj, bdata)
	// Формирование aCmd: Прогрев клапанов
	if (!start) fnFanWarm(resultFan, s)
	// Плавный пуск/стоп ВНО склада
	soft(bld, obj, s, seB, m, resultFan, bdata, 'normal')
}

// Комбинированный склад в холодильном режиме
function combi(bld, obj, s, seB, m, resultFan, bdata) {
	console.log(11, 'SOFT_COMBI_COLD', bld.name)
	const start = resultFan.start.includes(true)
	// Формирование aCmd: команда авторежима на вкл/выкл ВНО
	fnACmd(bld, resultFan, start, obj, bdata)
	// Плавный пуск/стоп ВНО склада
	soft(bld, obj, s, seB, m, resultFan, bdata, 'cold')
}

// У склада холодильник не будет ВНО камеры и соленоида подогрева

module.exports = {
	normal,
	combi,
}
