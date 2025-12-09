// const def = require('./fn')
// const { checkMain } = require('./fn/check')
const fnPrepare = require('./fn/prepare')
const { fnMode, fnModeMsg } = require('./fn/mode')

// Для обычного и комбинированного склада
// Удаление СО2 для всего склада
function coNormal(bld, sect, obj, s, se, m, alarm, acc, data, ban, resultFan) {
	console.log(1100, 'УДАЛЕНИЕ СО2: норм-комби', acc)
	// Подготовка данных
	const prepare = fnPrepare(bld, obj, s, m)
	if (!s?.co2?.mode || !def?.[s?.co2?.mode]) return
	// Выбор алгоритма ВВ
	const code = fnMode(prepare, s, acc)
	// Сообщение о выбранном алогритме
	fnModeMsg(bld, code, acc)
	// Проверка разрешения ВВ и очистка аккумулятора
	// if (!exit(bld, code, s, ban, prepare, acc, resultFan)) return
	// def[code](bld, obj, acc, m, se, s, prepare, resultFan)
	// Проверка открыт ли клапан
	// if (!checkMain(bld, obj, acc, o)) return
	// def.fnSol(bld, obj, acc)
	// console.log('\tresultFan', resultFan, 'Аккумулятор', JSON.stringify(acc))
}

module.exports = coNormal
