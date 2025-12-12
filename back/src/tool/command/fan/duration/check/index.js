const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const { getRFstg } = require('../../fn')
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
		.map((el, i) => (el && i < 1 ? dict[i] : null))
		.filter((el) => el !== null)
		.join('; ')

	// Запретить ДВ
	if (reason.some((el) => el)) {
		console.log(11, reason)
		clear(bld, prepare)
		if (!err) return false
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
	const { acc, cmd, isCC, s, bstart, secAuto, CO2work } = prepare
	// console.log(9900, resultFan)
	const ok = acc.byDur?.queue?.[0] && acc.byDur?.queue?.[1] && resultFan.start.includes(true)
	const rfStg = getRFstg(resultFan.stg)
	return [!s?.vent?.add, cmd.notDur, !bstart, !secAuto, CO2work, !!rfStg, isCC, ok]
}

module.exports = { fnCheck, clear }
