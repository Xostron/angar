const def = require('./def')
const fnPrepare = require('./fn/prepare')
const { fnMode, fnModeMsg } = require('./fn/mode')
const { exit } = require('./fn/exit')

// Для обычного и комбинированного склада
// Удаление СО2 для всего склада
function coNormal(bld, sect, obj, s, se, m, alarm, acc, data, ban, resultFan) {
	// Подготовка данных
	const prepare = fnPrepare(bld, obj, s, m)
	// Выбор алгоритма ВВ
	const code = fnMode(prepare, s, acc)
	// Сообщение о выбранном алгоритме
	fnModeMsg(bld, code, acc)
	// Проверка разрешения CO2 и очистка аккумулятора
	if (!exit(bld, obj, code, s, alarm, ban, prepare, acc, resultFan)) return
	def[code](bld, obj, s, se, m, alarm, prepare, acc, resultFan)
	// def.fnSol(bld, obj, acc)
}

module.exports = coNormal
