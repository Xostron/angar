const { delUnused } = require('@tool/command/extra')
const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra } = require('@tool/message/extra')
const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { readAcc } = require('@store/index')
const isCombiCold = require('@tool/combi/is')

function fnPrepare(bld, obj, s) {
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	const am = obj.retain?.[bld._id]?.automode
	// Комби склад в режиме холодильника
	const isCC = isCombiCold(bld, am, s)
	// Комби склад в режиме обычного
	const isCN = !isCC
	// Обычный склад
	const isN = bld.type === 'normal'
	return { extraCO2, am, isCC, isCN, isN }
}

function exit(bld, sect, code, fanS, s, ban, prepare, acc, resultFan) {
	// Очистка аккумулятора и однократное выключение ВНО (acc.firstCycle - флаг для однократной отработки)
	if (!fnCheck(bld, sect, code, fanS, s, ban, prepare)) {
		// // Если режим ВВ = Вкл, то однократно выключаем ВНО
		// if (s.vent.mode === 'on') {
		// 	if (!acc?.firstCycle) resultFan.start = [false]
		// 	resultFan.force = false
		// }
		// // Если сейчас работает вы
		// if (acc?.byDura?.end) resultFan.start = [false]
		// acc.firstCycle = true
		clear(bld, sect, acc, 1, 1, 1, 1)
	}
}

/**
 * Разрешить/запретить ВВ в секции
 * Запретить:
 * 1. Таймер запрета ВВ
 * 2. Нет рабочих ВНО
 * 3. Режим вентиляции Выкл (для обычных складов/комби складов в режиме обычного)
 * 4. Аварийное закрытие клапанов
 * 5. Переключатель на щите
 * 6. Работает удаление СО2
 * 7. Алгоритм ВВ не определен = null
 * Разрешено: обычному складу и комби складу в обычном/холодильном режимах
 * @param {*} bld
 * @param {*} sect
 * @param {*} obj
 * @param {*} fanS
 * @param {*} s
 * @param {*} ban
 * @returns {boolean} true разрешить ВВ, false запретить ВВ
 */
function fnCheck(bld, sect, code, fanS, s, ban, prepare) {
	const { extraCO2, am, isCC, isCN, isN } = prepare
	const reason = [
		ban,
		!fanS.length,
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isN,
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isCN,
		isExtralrm(bld._id, sect._id, 'alrClosed'),
		isExtralrm(bld._id, sect._id, 'local'),
		extraCO2.start,
		code === null,
	]
	if (reason.some((el) => el)) {
		// Запретить ВВ
		console.log(5500, 'Запрет ВВ по причине')
		console.table(
			[
				{
					ban: reason[0],
					Нет_ВНО: reason[1],
					Обычный_выкл: reason[2],
					Комби_выкл: reason[3],
					Авар_закр_клап: reason[4],
					Перекл_на_щите: reason[5],
					Удаление_СО2: reason[6],
					'Режим не определен': reason[7],
				},
			],
			[
				'ban',
				'Нет_ВНО',
				'Обычный_выкл',
				'Комби_выкл',
				'Авар_закр_клап',
				'Перекл_на_щите',
				'Удаление_СО2',
				'Режим не определен',
			]
		)
		return false
	}
	// Разрешить ВВ
	return true
}

/**
 * Выбор алгоритма ВВ
 * 1. Режим Вкл (для обычного и комби в режиме обычного)
 * 2. Режим Авто
 * - Выравнивание температуры (для обычного и комби в режиме обычного)
 * - по таймеру (для обычного и комби в режиме обычного)
 * - по таймеру (для комби в режиме холодильника)
 * Примечание:
 * - режим Выкл выполняется в exit (только для обычного и комби в режиме обычного)
 * @param {*} bld
 * @param {*} sect
 * @param {*} prepare
 * @param {*} acc
 */
function fnSelect(prepare, acc) {
	const { extraCO2, am, isCC, isCN, isN } = prepare
	if ((isN || isCN) && s?.vent?.mode === 'on') return 'on'
	if ((isN || isCN) && s?.vent?.mode === 'auto' && s?.vent?.add && s?.vent?.max_add) return 'dura'
	if ((isN || isCN) && s?.vent?.mode === 'auto' && acc.autoAdd) return 'time'
	if (isCC) return 'combiCold'
	return null
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

// Очистка аккумуляторов
function clear(bld, sect, acc, ...args) {
	acc.byDura = {}
	acc.byTime = {}
	args[0] ? delExtra(bld._id, sect._id, 'vent_on') : null
	args[1] ? delExtra(bld._id, sect._id, 'vent_dura') : null
	args[2] ? delExtra(bld._id, sect._id, 'vent_time_wait') : null
	args[3] ? delExtra(bld._id, sect._id, 'vent_time') : null
}

module.exports = { exit, fnPrepare, fnSelect, fnMsg, isAccessTime, clear }
