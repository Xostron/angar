const def = require('./fn')
const { delUnused } = require('@tool/command/extra')

// Разгонные вентиляторы
function accelOn(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (['time', 'temp', 'cold'].includes(s?.accel?.mode)) return
	if (!s?.accel?.mode || !def?.[s?.accel?.mode]) return
	// Разрешение работы
	// if (!def.check(building, obj)) return def.clear(building, m.fanA, acc)

	def[s?.accel?.mode](building, m.fanA, acc, se, s, m, obj)

	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
}

// Режим авто - По времени/По температуре: Работает когда склад включен
function accelAuto(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (!['time', 'temp', 'cold'].includes(s?.accel?.mode)) return
	if (!s?.accel?.mode || !def?.[s?.accel?.mode]) return

	// Разрешение работы
	// if (!def.check(building, obj)) return def.clear(building, m.fanA, acc)

	def[s.accel.mode](building, m.fanA, acc, se, s, m, obj)
	// def.cold(building, m.fanA, acc, se, s, m)

	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
}

module.exports = { accelOn, accelAuto }

function fnMsg(building, acc, s) {
	if (acc.lastMode != s?.accel?.mode) {
		acc.lastMode = s?.accel?.mode
		let code
		switch (s?.accel?.mode) {
			case 'off':
			case null:
				code = 51
				break
			case 'on':
				code = 52
				break
			case 'time':
				code = 53
				break
			case 'temp':
				code = 54
				break
			case 'cold':
				code = 55
				break	
			default:
				code = 399
				break
		}
		const arr = [null, 'off', 'on', 'temp', 'time', 'cold']
		delUnused(arr, s?.accel?.mode, building, code, 'accel')
	}
}
