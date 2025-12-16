const { data: store } = require('@store')
const { longOpn, longCls, fnClear } = require('./fn')
const { delExtralrm } = require('@tool/message/extralrm')
const fnPrepare = require('./fn/prepare')

/**
 * Авария клапана: долгое открытие/закрытие
 */
function alarmV(bld, sect, obj, s, se, m, automode, acc, data) {
	const { retain, value } = obj

	console.log(4400, '@@@@@@@@@@@@@@@@@@@@@@\n')
	const prepare = fnPrepare(bld, sect, obj, s, se, m, automode, acc, data)
	console.log('prepare', prepare)

	// Сброс аварии
	if (acc.flag && !acc._alarm) fnClear(acc, prepare)

	// Проход по клапанам секций в авто
	for (const v of prepare.vlv) {
		acc[v._id] ??= {}
		// Проверка и взвод аварии
		longOpn(bld, obj, v, s, acc)
		longCls(bld, obj, v, s, acc)
	}

	console.log('acc', acc)
	console.log(4400, '@@@@@@@@@@@@@@@@@@@@@@\n')
	return acc._alarm ?? false
}

module.exports = alarmV
