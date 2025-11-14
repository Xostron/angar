const off = require('./cold/off')
const blow = require('./cold/blow')
const defrost = require('./cold/defrost')
const drain = require('./cold/drain')

const offCombi = require('./combi/off')
const blowCombi = require('./combi/blow')
const defrostCombi = require('./combi/defrost')
const drainCombi = require('./combi/drain')
const check = require('../check')

// Алгоритм работы испарителя соленоид-вентилятор-оттайка
const def = {
	// Холодильник
	cold: {
		// Выключен
		'off-off-off': off,
		// Набор холода
		'on-off-off': (fnChange, accAuto, acc, se, s, bld, clr) =>
			check.cold(fnChange, 'frost', accAuto, acc, se, s, bld, clr),
		// Охлаждение
		'on-on-off': (fnChange, accAuto, acc, se, s, bld, clr) =>
			check.cold(fnChange, 'cooling', accAuto, acc, se, s, bld, clr),
		// Обдув
		'off-on-off': blow,
		// Оттайка
		'off-off-on': defrost,
		// Стекание воды
		'off-off-off-add': drain,
	},
	// Комбинированный
	combi: {
		// Выключен
		'off-off-off': offCombi,
		// Набор холода
		'on-off-off': (fnChange, accCold, acc, se, s, bld, clr) =>
			check.combi(fnChange, 'frost', accCold, acc, se, s, bld, clr),
		// Охлаждение
		'on-on-off': (fnChange, accCold, acc, se, s, bld, clr) =>
			check.combi(fnChange, 'cooling', accCold, acc, se, s, bld, clr),
		// Обдув
		'off-on-off': (fnChange, accCold, acc, se, s, bld, clr) =>
			check.combi(fnChange, 'blow', accCold, acc, se, s, bld, clr),
		// Комбинированный - что оттайка и стекание блокирует полностью склад?
		// Оттайка
		'off-off-on': defrostCombi,
		// Стекание воды
		'off-off-off-add': drainCombi,
	},
}

module.exports = def
