const { ctrlDO, ctrlAO } = require('@tool/command/module_output')
const byCurrent = require('./by_current')
const _MAX_SP = 100
const _MIN_SP = 20

function ctrlFanClr(idB, f, clr, s, se, accCold) {
	// Игнор команды
	if (f === null) return
	// 0 выкл, 1 включить
	clr.fan.forEach((el) => {
		ctrlDO(el, idB, f ? 'on' : 'off')
		const sp = f ? getSP(idB, clr, el, se, accCold) : _MIN_SP
		if (el?.ao?.id) ctrlAO(el, idB, sp)
	})
}

/**
 * Регулирование задания ПЧ испарителя в зависимости:
 * 1) от тока
 * 2) TODO от максимального давления в канале
 * @param {*} idB
 * @param {*} f
 * @param {*} fan
 * @param {*} se
 * @param {*} accCold
 * @return {number} задание ПЧ, %
 */
function getSP(idB, clr, fan, s, se, accCold) {
	let sp = _MAX_SP
	sp = byCurrent(sp, clr, fan, s, se, accCold)
	// sp = accCold?.[clr._id]?.offPressureSP ?? sp

	return sp
}

module.exports = ctrlFanClr
