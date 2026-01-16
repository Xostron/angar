const { data: store } = require('@store')
const { long, fnClear } = require('./fn')
const fnPrepare = require('./fn/prepare')
const { isReset } = require('@tool/reset')

/**
 * Авария клапана: долгое открытие/закрытие
 * Только для клапанов в авторежиме
 */
function alarmV(bld, sect, obj, s, se, m, automode, acc, data) {
	const { retain, value } = obj

	const prepare = fnPrepare(bld, sect, obj, s, se, m, automode, acc, data)

	// Сброс аварии
	if (acc.flag && !acc._alarm || isReset(bld._id)) fnClear(bld, acc, prepare)

	// Проход по клапанам секций в авто
	for (const v of prepare.vlv) {
		// Проверка и взвод аварии при открытии/закрытии
		// long(bld, obj, v, s, acc,prepare, 'open')
		long(bld, obj, v, s, acc,prepare, 'close')
	}

	return acc._alarm ?? false
}

module.exports = alarmV
