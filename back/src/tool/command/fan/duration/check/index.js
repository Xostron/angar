const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const dict = {
	0: 'настройки "Вентиляция": дополнительная вентиляция = 0%',
	1: 'аварийная ситуация',
	2: 'склад выключен',
	3: 'нет секций в авто режиме',
	4: 'работает удаление СО2',
	5: 'работает внутренняя вентиляция',
	6: 'комбинированный склад работает в режиме холодильника',
	7: 'склад работает по авто режиму',
}

/**
 * Разрешение на работу
 * @param {*} prepare
 * @return {boolean} true разрешение на работу
 */
function fnCheck(bld, prepare, resultFan) {
	// Вычисление причин запрета дополнительной вентиляции
	const reason = fnReason(prepare, resultFan)
	// Собираем причины для вывода в сообщение
	const err = reason
		.map((el, i) => (el ? dict[i] : null))
		.filter((el) => el !== null)
		.join('; ')
	// Запретить ДВ
	if (reason.some((el) => el)) {
		// consoleTable(reason)
		console.log(11, reason)
		clear(bld, prepare)
		if (reason[7] || reason[5]) return false
		wrExtra(bld._id, null, 'durVent', msgB(bld, 148, `${err}`), 'check')
		return false
	}
	// Разрешить ДВ
	delExtra(bld._id, null, 'durVent', 'check')
	return true
}

// Очистка аккумулятора, удаление сообщение о работе ДВ
function clear(bld, prepare) {
	prepare.acc.byDur = {}
	delExtra(bld._id, null, 'durVent', 'work')
}

// Вычисление причин запрета дополнительной вентиляции
function fnReason(prepare, resultFan) {
	const { acc, cmd, isCC, s, bstart, secAuto, extraCO2 } = prepare
	console.log(9900, resultFan)
	const ok = acc.byDur?.queue?.[0] && acc.byDur?.queue?.[1] && resultFan.start.includes(true)
	return [!s?.vent?.add, cmd.notDur, !bstart, !secAuto, extraCO2.start, !!resultFan.stg, isCC, ok]
}

module.exports = { fnCheck, clear }
