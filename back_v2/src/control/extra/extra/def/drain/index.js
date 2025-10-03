const def = require('./fn')
const { fnAlarm, delUnused } = require('@tool/command/extra')
const { delExtra } = require('@tool/message/extra')

// Оттайка слива воды
// Холодильник вкл/выкл - ручной режим
function drainOn(building, section, obj, s, se, m, alarm, acc, data, ban) {
	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
	fnAlarm(building, m.cold.heating, obj.value)
	if (['auto', 'temp'].includes(s?.cooler?.drain)) return
	if (!def?.[s?.cooler?.drain]) return
	// Обработка по режиму
	def[s?.cooler?.drain](building, m.cold.heating, obj?.value, acc, se, s)
}

// Холодильник включен - авторежим
function drainAuto(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (!['auto', 'temp'].includes(s?.cooler?.drain)) return
	if (!def?.[s?.cooler?.drain]) return
	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
	def[s?.cooler?.drain](building, m.cold.heating, obj?.value, acc, se, s, m)
	fnAlarm(building, m.cold.heating, obj.value)
}

// Очистка сообщения "Оттайка слива воды: вкл(выкл)"
function drainOff(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (['auto', 'temp'].includes(s?.cooler?.drain)) delExtra(building._id, null, 'drainRun')
}

function fnMsg(building, acc, s) {
	if (acc.lastMode !== s?.cooler?.drain) {
		delete acc.work
		delete acc.wait
		acc.lastMode = s?.cooler?.drain
		let code
		switch (s?.cooler?.drain) {
			case 'off':
			case null:
				code = 67
				break
			case 'on':
				code = 68
				break
			case 'auto':
				code = 69
				break
			case 'temp':
				code = 70
				break
		}
		const arr = [null, 'off', 'on', 'temp', 'auto']
		delUnused(arr, s?.cooler?.drain, building, code, 'drain')
	}
}

module.exports = { drainAuto, drainOn, drainOff }
