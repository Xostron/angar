const { delUnused } = require('@tool/command/extra')
const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra } = require('@tool/message/extra')
const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { readAcc } = require('@store/index')
const isCombiCold = require('@tool/combi/is')

/**
 * Разрешить/запретить ВВ в секции
 * Запретить:
 * 1. Нет рабочих ВНО
 * 2. Режим вентиляции Выкл (для обычных складов/комби складов в режиме обычного)
 * 3. Таймер запрета ВВ
 * 4. Аварийное закрытие клапанов
 * 5. Переключатель на щите
 * 6. Работает удаление СО2
 * @param {*} bld
 * @param {*} sect
 * @param {*} obj
 * @param {*} fanS
 * @param {*} s
 * @param {*} ban
 * @returns {boolean} true разрешить ВВ, false запретить ВВ
 */
function isAccess(bld, sect, obj, fanS, s, ban) {
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	const am = obj.retain?.[bld._id]?.automode
	const isCC = isCombiCold(bld, am, s)
	if (
		!fanS.length ||
		(!s?.vent?.mode && bld.type === 'normal') ||
		(s?.vent?.mode === 'off' && bld.type === 'normal') ||
		(!s?.vent?.mode && !isCC) ||
		(s?.vent?.mode === 'off' && !isCC) ||
		ban ||
		isExtralrm(bld._id, sect._id, 'alrClosed') ||
		isExtralrm(bld._id, sect._id, 'local') ||
		extraCO2.start
	)
		return false
	// Разрешить
	return true
}

// Сообщения режимы работы вентиляции
function fnMsg(bld, acc, s) {
	if (acc.lastMode != s?.vent?.mode) {
		acc.lastMode = s?.vent?.mode
		let code
		switch (s?.vent?.mode) {
			case null:
			case 'off':
				code = 56
				break
			case 'on':
				code = 57
				break
			case 'auto':
				code = 58
				break
			default:
				code = 399
				break
		}
		const arr = [null, 'off', 'on', 'auto']
		delUnused(arr, s?.vent?.mode, bld, code, 'vent')
	}
}

function isAccessTime(bld, obj) {
	const am = obj.retain?.[bld._id]?.automode
	const finish = isAchieve(bld._id, am, 'finish')
	const alrAuto = isAlr(bld._id, am)
	const openVin = isExtralrm(bld._id, null, 'openVin')
	if (!finish && !alrAuto && !openVin) return false
	return true
}

function clear(bld, sect, acc, ...args) {
	acc.byDura = {}
	acc.byTime = {}
	args[0] ? delExtra(bld._id, sect._id, 'vent_on') : null
	args[1] ? delExtra(bld._id, sect._id, 'vent_dura') : null
	args[2] ? delExtra(bld._id, sect._id, 'vent_time_wait') : null
	args[3] ? delExtra(bld._id, sect._id, 'vent_time') : null
}

module.exports = { isAccess, fnMsg, isAccessTime, clear }
