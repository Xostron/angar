const off = require('./off');
const blow = require('./blow');
const defrost = require('./defrost');
const drain = require('./drain');
const check = require('./check')

const def = {
	// Выключен
	'off-off-off': off,
	// Набор холода
	'on-off-off': (fnChange, acc, se, s, bld) =>
		check(fnChange, 'frost', acc, se, s, bld),
	// Охлаждение
	'on-on-off': (fnChange, acc, se, s, bld) =>
		check(fnChange, 'cooling', acc, se, s, bld),
	// Обдув
	'off-on-off': blow,

	// TODO Комбинированный - что оттайка и стекание блокирует полностью склад?
	// Оттайка
	'off-off-on': defrost,
	// Стекание воды
	'off-off-off-add': drain,
};

module.exports = def;
