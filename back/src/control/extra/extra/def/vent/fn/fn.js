const { delUnused } = require('@tool/command/extra')
const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { readAcc } = require('@store/index')
const { isCombiCold } = require('@tool/combi/is')
const { msg } = require('@tool/message')

function fnPrepare(bld, sect, obj, s) {
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	const am = obj.retain?.[bld._id]?.automode
	// Комби склад в режиме холодильника
	const isCC = isCombiCold(bld, am, s)
	// Комби склад в режиме обычного
	const isCN = !isCC
	// Обычный склад
	const isN = bld.type === 'normal'
	// Склад выключен
	const start = obj.retain[bld._id].start
	// Секция в авто
	const secAuto = obj.retain[bld._id].mode?.[sect._id]
	// Комби склад в режиме холодильника - флаг выкл по достижению задания
	const cFlagFinish = readAcc(bld._id, 'combi')?.cold?.flagFinish
	return { extraCO2, am, isCC, isCN, isN, start, secAuto, cFlagFinish }
}

/**
 * Проверка разрешения работы ВВ
 * Если проверка не прошла выключение ВВ и очистка аккумуляторов и соообщений
 * @param {*} bld
 * @param {*} sect
 * @param {*} code
 * @param {*} fanS
 * @param {*} s
 * @param {*} ban
 * @param {*} prepare
 * @param {*} acc
 * @param {*} resultFan
 * @returns {boolean} true - разрешить работу, false - запрет работы
 */
function exit(bld, sect, code, fanS, s, ban, prepare, acc, resultFan) {
	// Очистка аккумулятора и однократное выключение ВНО (acc.firstCycle - флаг для однократной отработки)
	if (!fnCheck(bld, sect, code, fanS, s, ban, prepare)) {
		resultFan.force.push(false)
		clear(bld, sect, acc, 1, 1, 1, 1)
		return false
	}
	return true
}

const dict = {
	0: 'таймер запрета активен',
	1: 'вентиляторы неисправны',
	2: 'режим вентиляции - Выкл',
	3: 'режим вентиляции - Выкл',
	4: 'аварийное закрытие клапанов',
	5: 'переключатель на щите',
	6: 'работает удаление СО2',
	7: 'алгоритм вентиляции неопределен',
	8: 'склад выключен',
	9: 'секция не в авто',
	10: 'Комбинированный склад в режиме холодильника (нет настройки "Время работы")',
	11: 'Комбинированный склад в режиме холодильника (задание продукта не достигнуто)',
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
 * 8. Настройка "Кол-во ВНО = 0"
 * 9. Склад выключен, секция не в авто
 * 10. Комби склад в режиме холодильника: нет настроек
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
	const { extraCO2, am, isCC, isCN, isN, start, secAuto, cFlagFinish } = prepare
	const reason = [
		ban,
		!fanS.length,
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isN,
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isCN,
		isExtralrm(bld._id, sect._id, 'alrClosed'),
		isExtralrm(bld._id, sect._id, 'local'),
		extraCO2?.start,
		code === null,
		!start,
		!secAuto,
		!s?.coolerCombi?.work && code === 'combiCold',
		!cFlagFinish && code === 'combiCold',
	]

	const err = reason
		.map((el, i) => (el ? dict[i] : null))
		.filter((el) => el !== null)
		.join(', ')
	console.log(77, sect.name, 'Условия ВВ не подходят по причине', reason, err)

	if (reason.some((el) => el)) {
		// Запретить ВВ
		console.table(
			[
				{
					ban: reason[0],
					ВНО_0: reason[1],
					Выкл_Обыч: reason[2],
					Выкл_Комби: reason[3],
					alrClosed: reason[4],
					local: reason[5],
					CО2: reason[6],
					def_null: reason[7],
					not_start: reason[8],
					not_secAuto: reason[9],
					combiCold: reason[10],
					combiCold2: reason[11],
				},
			],
			[
				'ban',
				'ВНО_0',
				'Выкл_Обыч',
				'Выкл_Комби',
				'alrClosed',
				'local',
				'CО2',
				'def_null',
				'not_start',
				'not_secAuto',
				'combiCold',
				'combiCold2',
			]
		)
		wrExtra(bld._id, sect._id, 'ventCheck', msg(bld, sect, 143, `${err}`))
		return false
	}
	delExtra(bld._id, sect._id, 'ventCheck')
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
function fnSelect(prepare, s, acc) {
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
