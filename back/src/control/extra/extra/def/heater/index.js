const { isDemo } = require('@tool/demo/fn/fn')
const def = require('./def')
const { delUnused } = require('@tool/command/extra')

// Тепловые пушки - подогрев канала
function heater(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(bld._id)) return
	console.log(11, m.heater)
	if (!def.check(bld, m, acc, se, s, obj)) return

	// def[s?.heater?.mode ?? 'off'](bld,  m.heater, acc, se, s, m, obj)

	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)
}

module.exports = { heater }

function fnMsg(bld, acc, s) {
	if (acc.lastMode != s?.heater?.mode) {
		acc.lastMode = s?.heater?.mode
		let code
		switch (s?.heater?.mode) {
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
		delUnused(arr, s?.heater?.mode, bld, code, 'heater')
	}
}
