const { delExtra, wrExtra } = require('@tool/message/extra')
const { ctrlDO } = require('@tool/command/module_output')
const { msg } = require('@tool/message')
const { isCombiCold } = require('@tool/combi/is')

// Подогрев канала: Вкл
function on(bld, heater) {
	heater.forEach((f) => {
		ctrlDO(f, bld._id, 'on')
	})
}
// Подогрев канала: Выкл
function off(bld, heater) {
	heater.forEach((f) => {
		ctrlDO(f, bld._id, 'off')
	})
}

// Подогрев канала: По температуре
function auto(bld, heater, acc, se, s) {
	// Датчики канала неисправны - выкл пушки
	if (se.tin == null) {
		delExtra(bld._id, null, 'heater', 'run')
		wrExtra(
			bld._id,
			null,
			'heater',
			msg(bld, sect, 125, '. По причине: датчики канала неисправны'),
			'stop',
		)
		return off(bld, heater)
	}
	// Выкл пушки
	if (se.tin > s.heater.target) {
		delExtra(bld._id, null, 'heater', 'run')
		wrExtra(
			bld._id,
			null,
			'heater',
			msg(bld, sect, 125, `. По причине: Ткан ${se.tcnl}° > Задание ${s.heater.target}°`),
			'stop',
		)
		return off(bld, heater)
	}
	// Вкл пушки
	if (se.tin < s.heater.target - s.heater.hysteresis) {
		delExtra(bld._id, null, 'heater', 'stop')
		wrExtra(bld._id, null, 'heater', msg(bld, sect, 124), 'run')
		return on(bld, heater)
	}
}

// Разрешение на работу подогрева канала
/**
 *
 * @param {*} bld
 * @param {*} heater
 * @param {*} acc
 * @param {*} se
 * @param {*} s
 * @returns false - запрет
 */
function check(bld, m, acc, se, s, obj) {
	// Режим не авто. Удаляем сообщения режима авто
	if (s?.heater?.mode != 'auto') clear(bld)

	// Допуск
	// Комби-холод (в этом режиме пушки отключаются)
	const am = obj.retain?.[bld._id]?.automode
	const isCC = isCombiCold(bld, am, s)
	// Разгонники Выключены
	const isOff = !m.fanA.some((el) => obj.value[el._id].state == 'run')
	// Запрет работы: комби-холод, разгонники выключены
	if (isCC || isOff) {
		clear(bld)
		off(bld, m.heater)
		return false
	}
	return true
}

function clear(bld) {
	delExtra(bld._id, null, 'heater', 'stop')
	delExtra(bld._id, null, 'heater', 'run')
}

module.exports = {
	on,
	auto,
	off,
	check,
}
