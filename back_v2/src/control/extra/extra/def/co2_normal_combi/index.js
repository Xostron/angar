const def = require('./fn')
const { fnAlarm, delUnused } = require('@tool/command/extra')

// Для обычного и комбинированного склада
// Удаление СО2 для всего склада
// Ручной режим вкл/выкл
function coNormal(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	if (!s?.co2?.mode || !def?.[s?.co2?.mode]) return
	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)
	def[s?.co2?.mode](bld, obj, acc, m, se, s)
	def.fnSol(bld, obj, acc)
}

module.exports = coNormal

function fnMsg(bld, acc, s) {
	if (acc.lastMode !== s?.co2?.mode) {
		delete acc.work
		delete acc.wait
		delete acc.start
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
			case 'sensor':
				code = 64
				break
		}
		const arr = [null, 'off', 'on', 'sensor', 'time']
		delUnused(arr, s?.co2?.mode, bld, code, 'co2')
	}
}
