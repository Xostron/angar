const { fnAlarm, delUnused } = require('@tool/command/extra')
const { isDemo } = require('@tool/demo/fn/fn')
const def = require('./fn')

// Удаление СО2
function coOn(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	if (['time', 'sens'].includes(s?.co2?.mode)) return
	if (!s?.co2?.mode || !def?.[s?.co2?.mode]) return
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(bld._id)) return
	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)
	def[s?.co2?.mode](bld, m.cold.device.co2, obj?.value, acc, se, s)
	fnAlarm(bld, m.cold.device.co2, obj.value)
}

// Режим авто - По времени/По температуре: Работает когда склад включен
function coAuto(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	if (!['time', 'sens'].includes(s?.co2?.mode)) return
	if (!s?.co2?.mode || !def?.[s?.co2?.mode]) return
	// Если включен демо-режим блокировать данную функцию
	if (isDemo(bld._id)) return
	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)
	def[s.co2.mode](bld, m.cold.device.co2, obj?.value, acc, se, s)
	fnAlarm(bld, m.cold.device.co2, obj.value)
}

module.exports = { coOn, coAuto }

function fnMsg(bld, acc, s) {
	if (acc.lastMode !== s?.co2?.mode) {
		delete acc.work
		delete acc.wait
		acc.lastMode = s?.co2?.mode
		let code
		switch (s?.co2?.mode) {
			case 'off':
			case null:
				code = 61
				break
			case 'on':
				code = 62
				break
			case 'time':
				code = 63
				break
			case 'sens':
				code = 64
				break
		}
		const arr = [null, 'off', 'on', 'sens', 'time']
		delUnused(arr, s?.co2?.mode, bld, code, 'co2')
	}
}
