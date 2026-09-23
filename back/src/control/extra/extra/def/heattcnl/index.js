const { isDemo } = require('@tool/demo/fn/fn')
const def = require('./def')
const { delUnused } = require('@tool/command/extra')

// Тепловые пушки - подогрев канала
function heattcnl(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(bld._id)) return

	if (!def.check(bld, sect, m, acc, se, s, obj)) return

	def[s?.heattcnl?.mode ?? 'off'](bld, sect, m.heattcnl, acc, se, s, m, obj)

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
				code = 121
				break
			case 'on':
				code = 122
				break
			case 'auto':
				code = 123
				break
			default:
				code = 399
				break
		}
		const arr = [null, undefined, 'off', 'on', 'auto']
		delUnused(arr, s?.heattcnl?.mode, bld, code, 'heattcnl')
	}
}
