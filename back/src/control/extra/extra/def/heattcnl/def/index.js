const { ctrlDO } = require('@tool/command/module_output')

// Разгонные вентиляторы: Вкл
function on(bld, heattcnl) {
	heattcnl.forEach((f) => {
		ctrlDO(f, bld._id, 'on')
	})
}
// Разгонные вентиляторы: Выкл
function off(bld, heattcnl) {
	heattcnl.forEach((f) => {
		ctrlDO(f, bld._id, 'off')
	})
}

// Разгонные вентиляторы: По температуре
function auto(bld, heattcnl, acc, se, s) {
	// Датчики канала неисправны - выкл пушки
	if (se.tcnl == null) return off(bld, heattcnl)
	// Выкл пушки
	if (se.tcnl > s.heattcnl.target) return off(bld, heattcnl)
	// Вкл пушки
	if (se.tcnl < s.heattcnl.target - s.heattcnl.hysteresis) return on(bld, heattcnl)
}

module.exports = {
	on,
	auto,
	off,
}
