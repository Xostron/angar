const def = require('./fn')
const { data: store, delExtra, wrExtra } = require('@store')
const { msgB } = require('@tool/message')
const { fnAlarm } = require('@tool/command/extra')

// Оттайка слива воды
// Холодильник вкл/выкл - ручной режим
function drainOn(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (['auto', 'temp'].includes(s?.cooler?.drain)) return
	if (!s?.cooler?.drain || !def?.[s?.cooler?.drain]) return
	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
	def[s?.cooler?.drain](building, m.cold.heating, obj?.value, acc, se, s)
	fnAlarm(building, m.cold.heating, obj.value)
}

// Холодильник включен - авторежим
function drainAuto(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (!['auto', 'temp'].includes(s?.cooler?.drain)) return
	if (!s?.cooler?.drain || !def?.[s?.cooler?.drain]) return
	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
	def[s?.cooler?.drain](building, m.cold.heating, obj?.value, acc, se, s, m)
	fnAlarm(building, m.cold.heating, obj.value)
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
		delExtra(building._id, null, 'drain')
		wrExtra(building._id, null, 'drain', {
			date: new Date(),
			...msgB(building, code),
		})
	}
}

module.exports = { drainAuto, drainOn }
