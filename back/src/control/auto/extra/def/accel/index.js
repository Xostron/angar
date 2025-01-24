const def = require('./fn')
const { data: store, delExtra, wrExtra } = require('@store')
const { msgB } = require('@tool/message')

// Разгонные вентиляторы

function accelOn(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (['time', 'temp'].includes(s?.accel?.mode)) return
	if (!s?.accel?.mode || !def?.[s?.accel?.mode]) return

	def[s?.accel?.mode](building, m.fanA, acc, se, s)

	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
}

// Режим авто - По времени/По температуре: Работает когда склад включен
function accelAuto(building, section, obj, s, se, m, alarm, acc, data, ban) {
	if (!['time', 'temp'].includes(s?.accel?.mode)) return
	if (!s?.accel?.mode || !def?.[s?.accel?.mode]) return

	def[s.accel.mode](building, m.fanA, acc, se, s)

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
			default:
				code = 400
				break
		}
		delUnused(s?.accel?.mode, building, code)
		// delExtra(building._id, null, 'accel', s?.accel?.mode ?? 'off')
		// wrExtra(
		// 	building._id,
		// 	null,
		// 	'accel',
		// 	{
		// 		date: new Date(),
		// 		...msgB(building, code),
		// 	},
		// 	s?.accel?.mode ?? 'off'
		// )
	}
}

function delUnused(cur, building, code) {
	;[null, 'off', 'on', 'temp', 'time'].forEach((el) => {
		if (el == cur) return wrExtra(building._id, null, 'accel', { date: new Date(), ...msgB(building, code) }, cur ?? 'off')
		// console.log(1111, el)
		delExtra(building._id, null, 'accel', el ?? 'off')
	})
}
