const { delExtra, wrExtra } = require('@tool/message/extra')
const { ctrlDO } = require('@tool/command/module_output')
const { msg } = require('@tool/message')
const { isCombiCold } = require('@tool/combi/is')

// Подогрев канала: Вкл
function on(bld, sect, heattcnl) {
	heattcnl.forEach((f) => {
		ctrlDO(f, bld._id, 'on')
	})
}
// Подогрев канала: Выкл
function off(bld, sect, heattcnl) {
	heattcnl.forEach((f) => {
		ctrlDO(f, bld._id, 'off')
	})
}

// Подогрев канала: По температуре
function auto(bld, sect, heattcnl, acc, se, s) {
	// Датчики канала неисправны - выкл пушки
	if (se.tcnl == null) {
		delExtra(bld._id, sect._id, 'heattcnl', 'run')
		wrExtra(
			bld._id,
			sect._id,
			'heattcnl',
			msg(bld, sect, 125, '. По причине: датчики канала неисправны'),
			'stop',
		)
		return off(bld, sect, heattcnl)
	}
	// Выкл пушки
	if (se.tcnl > s.heattcnl.target) {
		delExtra(bld._id, sect._id, 'heattcnl', 'run')
		wrExtra(
			bld._id,
			sect._id,
			'heattcnl',
			msg(bld, sect, 125, `. По причине: Ткан ${se.tcnl}° > Задание ${s.heattcnl.target}°`),
			'stop',
		)
		return off(bld, sect, heattcnl)
	}
	// Вкл пушки
	if (se.tcnl < s.heattcnl.target - s.heattcnl.hysteresis) {
		delExtra(bld._id, sect._id, 'heattcnl', 'stop')
		wrExtra(bld._id, sect._id, 'heattcnl', msg(bld, sect, 124), 'run')
		return on(bld, sect, heattcnl)
	}
}

// Разрешение на работу подогрева канала
/**
 *
 * @param {*} bld
 * @param {*} sect
 * @param {*} heattcnl
 * @param {*} acc
 * @param {*} se
 * @param {*} s
 * @returns false - запрет
 */
function check(bld, sect, m, acc, se, s, obj) {
	// Режим не авто. Удаляем сообщения режима авто
	if (s?.heattcnl?.mode != 'auto') clear(bld, sect)

	// Допуск
	// Комби-холод (в этом режиме пушки отключаются)
	const am = obj.retain?.[bld._id]?.automode
	const isCC = isCombiCold(bld, am, s)
	// ВНО Выключены
	const isOff = !m.fanSAll.some((el) => obj.value[el._id].state == 'run')
	// Запрет работы: комби-холод, ВНО выключены
	if (isCC || isOff) {
		clear(bld, sect)
		off(bld, sect, m.heattcnl)
		return false
	}
	return true
}

function clear(bld, sect) {
	delExtra(bld._id, sect._id, 'heattcnl', 'stop')
	delExtra(bld._id, sect._id, 'heattcnl', 'run')
}

module.exports = {
	on,
	auto,
	off,
	check,
}
