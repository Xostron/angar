const { delExtra, wrExtra } = require('@tool/message/extra')
const { ctrlDO } = require('@tool/command/module_output')
const { msgB } = require('@tool/message')
const { isCombiCold } = require('@tool/combi/is')

// Обогреватель: Вкл
function on(bld, heater) {
	heater.forEach((f) => {
		ctrlDO(f, bld._id, 'on')
	})
}
// Обогреватель: Выкл
function off(bld, heater) {
	heater.forEach((f) => {
		ctrlDO(f, bld._id, 'off')
	})
}

// Обогреватель: По температуре
function auto(bld, heater, acc, se, s, m, obj) {
	const isOk = m.heater.some((el) => {
		const q = obj?.value?.[el._id]
		return q.state != 'alarm'
	})
	const reason = [
		[se.tin == null, 'датчики потолка неисправны'],
		[
			se.tin > s.heater.on + s.heater.hysteresis,
			`Т потолка ${se.tin}° > Задание ${s.heater.on}°`,
		],
		[!isOk, 'все обогреватели в аварии'],
	]
		.filter((el) => el[0])
		.map((el) => el[1])

	// Выкл
	if (reason.length) {
		delExtra(bld._id, null, 'heater', 'run')
		wrExtra(bld._id, null, 'heater', msgB(bld, 129, `По причине: ${reason.join(', ')}`), 'stop')
		return off(bld, heater)
	}

	// Вкл
	if (se.tin < s.heater.on) {
		delExtra(bld._id, null, 'heater', 'stop')
		wrExtra(bld._id, null, 'heater', msgB(bld, 161), 'run')
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
