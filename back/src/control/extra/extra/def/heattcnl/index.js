const { isDemo } = require('@tool/demo/fn/fn')
const def = require('./def')
const { delUnused } = require('@tool/command/extra')
const { isCombiCold } = require('@tool/combi/is')

// Тепловые пушки - подогрев канала
function heattcnl(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(bld._id)) return

	// Комби-холод (в этом режиме пушки отключаются)
	const am = obj.retain?.[bld._id]?.automode
	const isCC = isCombiCold(bld, am, s)
	// ВНО Выключены
	const isOff = m.ff.every((el) => obj.value[el._id].state != 'run')
	// // Запрет работы: комби-холод, ВНО выключены
	if (isCC || isOff) return def.off(bld, m.heattcnl)

	def[s?.heattcnl?.mode ?? 'off'](bld, m.heattcnl, acc, se, s, m, obj)

	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)
}

module.exports = { heattcnl }

function fnMsg(bld, acc, s) {
	if (acc.lastMode != s?.heattcnl?.mode) {
		acc.lastMode = s?.heattcnl?.mode
		let code
		switch (s?.heattcnl?.mode) {
			case 'off':
			case null:
			case undefined:
				code = 51
				break
			case 'on':
				code = 52
				break
			case 'auto':
				code = 55
				break
			default:
				code = 399
				break
		}
		const arr = [null, undefined, 'off', 'on', 'auto']
		delUnused(arr, s?.heattcnl?.mode, bld, code, 'heattcnl')
	}
}
