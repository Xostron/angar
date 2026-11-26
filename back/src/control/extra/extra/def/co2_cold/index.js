const { fnAlarm, delUnused } = require('@tool/command/extra')
const { isDemo } = require('@tool/demo/fn/fn')
const def = require('./fn')
const { delExtra } = require('@tool/message/extra')

// Удаление СО2
function coOn(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	if (['time', 'sensor'].includes(s?.co2?.mode)) return
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
	if (!['time', 'sensor'].includes(s?.co2?.mode)) return
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
	let key
	switch (s?.co2?.mode) {
		case null:
		case 'off':
			key = 61

			break
		case 'on':
			key = 62
			break
		case 'time':
			key = 63
			break
		case 'sensor':
			key = 64
			break
	}

	if (key != 63) {
		delExtra(bld._id, null, 'co2', 'work')
		delExtra(bld._id, null, 'co2', 'wait')
		delete acc.byTime
	}

	const arrCode = ['off', 'on', 'time', 'sensor']
	delUnused(arrCode, s?.co2?.mode, bld, key, 'co2')
}
