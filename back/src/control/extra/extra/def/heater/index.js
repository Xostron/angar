const { isDemo } = require('@tool/demo/fn/fn')
const def = require('./def')
const { delUnused } = require('@tool/command/extra')

// Тепловые пушки - подогрев канала
function heater(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)
	
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(bld._id)) return
	if (!def.check(bld, m, acc, se, s, obj)) return
	
	def[s?.heater?.mode ?? 'off'](bld,  m.heater, acc, se, s, m, obj)
	
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
				code = 126
				break
			case 'on':
				code = 127
				break
			case 'auto':
				code = 128
				break
			default:
				code = 399
				break
		}
		const arr = [null, undefined, 'off', 'on', 'auto']
		delUnused(arr, s?.heater?.mode, bld, code, 'heater')
	}
}
