const { fnACmd, fnFanWarm } = require('./fn')
const soft = require('./soft')
const durVent = require('./duration')
/**
 * Обычный склад и Комбинированный склад в обычном режиме
 * @param {string} bld Cклад
 * @param {object} resultFan Задание на включение ВНО
 * @param {object} s Настройки склада
 * @param {object} obj Глобальные данные склада
 * @param {object} bdata Результат функции scan()
 */
function normal(bld, obj, s, seB, m, resultFan, bdata) {
	console.log('\n------------SOFT_COMBI_NORMAL------------', bld.name, '\n')
	// Формирование aCmd: команда авторежима на вкл/выкл ВНО
	durVent(bld, obj, s, seB, m, resultFan, bdata)
	fnACmd(bld, resultFan, obj, bdata)
	// Формирование aCmd: Прогрев клапанов
	const start = resultFan.start.includes(true)
	if (!start) fnFanWarm(resultFan, s)
	// Плавный пуск/стоп ВНО склада
	soft(bld, obj, s, seB, m, resultFan, bdata, 'normal')
	console.log('\n------------SOFT_COMBI_NORMAL------------', bld.name, '\n')
}

// Комбинированный склад в холодильном режиме
function combi(bld, obj, s, seB, m, resultFan, bdata) {
	console.log('\n------------SOFT_COMBI_COLD------------', bld.name, '\n')
	// Формирование aCmd: команда авторежима на вкл/выкл ВНО
	// durVent(bld, obj, s, seB, m, resultFan, bdata)
	fnACmd(bld, resultFan, obj, bdata)
	// Плавный пуск/стоп ВНО склада
	soft(bld, obj, s, seB, m, resultFan, bdata, 'cold')
	console.log('\n------------SOFT_COMBI_COLD------------', bld.name, '\n')
}

// У склада холодильник не будет ВНО камеры и соленоида подогрева

module.exports = {
	normal,
	combi,
}
