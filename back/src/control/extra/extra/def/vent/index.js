const { fnPrepare } = require('./fn/fn')
const { fnMode, fnModeMsg } = require('./fn/mode')
const { exit } = require('./fn/exit')
const def = require('./def')
const { data: store } = require('@store')

// Внутренняя вентиляция секции
function vent(bld, sect, obj, s, se, m, alarm, acc, data, ban, resultFan) {
	const { retain, factory, value } = obj
	console.log(77, 'vent', acc)
	// Подготовка данных
	const prepare = fnPrepare(bld, obj, s, m)
	// Выбор алгоритма ВВ
	const code = fnMode(prepare, s, acc)
	// Сообщение о выбранном алогритме
	fnModeMsg(bld, code, acc)
	// Проверка разрешения ВВ и очистка аккумулятора
	if (!exit(bld, code, s, alarm, ban, prepare, acc, resultFan)) return
	// Алгоритм ВВ
	def[code](obj, s, m, bld, alarm, prepare, acc, resultFan)
}
module.exports = vent
