const def = require('./fn')
const { delUnused } = require('@tool/command/extra')

// Разгонные вентиляторы
function accelCOn(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (s?.cooler?.accel === 'auto') return
	if (!s?.cooler?.accel || !def?.[s?.cooler?.accel]) return
	def[s?.cooler?.accel](building, m.fanA, acc, se, s)
	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
}

// Режим авто - По времени/По температуре: Работает когда склад включен
function accelCAuto(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (s?.cooler?.accel !== 'auto') return
	if (!s?.cooler?.accel || !def?.[s?.cooler?.accel]) return
	def[s?.cooler?.accel](building, m.fanA, acc, se, s, m, obj)

	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
}

module.exports = { accelCOn, accelCAuto }

function fnMsg(building, acc, s) {
	if (acc.lastMode != s?.cooler?.accel) {
		acc.lastMode = s?.cooler?.accel
		let code
		switch (s?.cooler?.accel) {
			case 'off':
			case null:
				code = 51
				break
			case 'on':
				code = 52
				break
			case 'auto':
				code = 83
				break
			default:
				code = 399
				break
		}
		const arr = [null, 'off', 'on', 'auto']
		delUnused(arr, s?.cooler?.accel, building, code, 'accel')
	}
}
