const def = require('./fn')
const { fnAlarm, delUnused } = require('@tool/command/extra')
const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const { isExtralrm } = require('@tool/message/extralrm')
// Для обычного и комбинированного склада
// Удаление СО2 для всего склада

function coNormal(bld, sect, obj, s, se, m, alarm, acc, data, ban) {
	if (!s?.co2?.mode || !def?.[s?.co2?.mode]) return
	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)
	const am = obj.retain?.[bld._id]?.automode
	const finish = isAchieve(bld._id, am, 'finish')
	const alrAuto = isAlr(bld._id, am)
	const openVin = isExtralrm(bld._id, null, 'openVin')
	// Условия СO2: достигнута темп. задания, авария авторежима
	if (!finish && !alrAuto && !openVin) {
		console.log('Условия удаления СО2 не обнаружены')
		delExtra(bld._id, null, 'co2', 'co2_wait')
		return def.clear(acc, 'work', 'wait', 'start')
	}
	console.log(`Условия удаления СО2: достиг задания ${finish}, авария авторежима ${alrAuto}`)
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
				acc.message = ''
				break
			case 'on':
				code = 62
				acc.message = '(постоянно)'
				break
			case 'time':
				code = 63
				acc.message = `(${s.co2.work / 60 / 1000}мин)`
				break
			case 'sensor':
				acc.message = '(по датчику)'
				code = 64
				break
		}
		const arr = [null, 'off', 'on', 'sensor', 'time']
		delUnused(arr, s?.co2?.mode, bld, code, 'co2')
	}
	if (acc.start) wrExtra(bld._id, null, 'co2', msgB(bld, 84, acc.message), 'co2_work')
	else delExtra(bld._id, null, 'co2', 'co2_work')
}
