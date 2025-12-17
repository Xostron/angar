const { data: store } = require('@store')
const { long, fnClear } = require('./fn')
const fnPrepare = require('./fn/prepare')

/**
 * Авария клапана: долгое открытие/закрытие
 * Только для клапанов в авторежиме
 */
function alarmV(bld, sect, obj, s, se, m, automode, acc, data) {
	const { retain, value } = obj

	console.log(4400, '@@@@@@@@@@@@@@@@@@@@@@\n')
	const prepare = fnPrepare(bld, sect, obj, s, se, m, automode, acc, data)
	// console.log('prepare', prepare)

	// Сброс аварии
	if (acc.flag && !acc._alarm) fnClear(bld, acc, prepare)

	// Проход по клапанам секций в авто
	for (const v of prepare.vlv) {
		// Проверка и взвод аварии при открытии/закрытии
		long(bld, obj, v, s, acc, 'open')
		long(bld, obj, v, s, acc, 'close')
	}

	console.log('acc', acc)
	console.log(4400, '@@@@@@@@@@@@@@@@@@@@@@\n')
	return acc._alarm ?? false
}

module.exports = alarmV
