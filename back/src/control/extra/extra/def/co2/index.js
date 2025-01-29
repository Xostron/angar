const def = require('./fn')
const { fnAlarm, delUnused } = require('@tool/command/extra')

// Удаление СО2
function coOn(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (['time', 'sens'].includes(s?.co2?.mode)) return
	if (!s?.co2?.mode || !def?.[s?.co2?.mode]) return
	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
	def[s?.co2?.mode](building, m.cold.device.co2, obj?.value, acc, se, s)
	fnAlarm(building, m.cold.device.co2, obj.value)
}

// Режим авто - По времени/По температуре: Работает когда склад включен
function coAuto(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (!['time', 'sens'].includes(s?.co2?.mode)) return
	if (!s?.co2?.mode || !def?.[s?.co2?.mode]) return

	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
	def[s.co2.mode](building, m.cold.device.co2, obj?.value, acc, se, s)
	fnAlarm(building, m.cold.device.co2, obj.value)
}

module.exports = { coOn, coAuto }

function fnMsg(building, acc, s) {
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
		delUnused(arr, s?.co2?.mode, building, code, 'co2')
	}
}
