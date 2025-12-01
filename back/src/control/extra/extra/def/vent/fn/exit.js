const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { msg, msgB } = require('@tool/message')
const dict = {
	0: 'таймер запрета активен',
	1: 'вентиляторы неисправны',
	2: 'режим вентиляции - Выкл',
	3: 'режим вентиляции - Выкл',
	4: 'авария низкой температуры',
	5: 'переключатель на щите',
	6: 'работает удаление СО2',
	7: 'не выбран авторежим и(или) продукт, нет настроек, тип склада',
	8: 'склад выключен',
	9: 'секция не в авто',
	10: 'настройки "Холодильник С" (Работа ВВ = 0)',
	11: 'комби-холодильник (задание продукта еще не достигнуто)',
	12: 'настройка "Вентиляция" (Работа ВВ = 0)',
}

/**
 * Проверка разрешения работы ВВ
 * Если проверка не прошла выключение ВВ и очистка аккумуляторов и соообщений
 * @param {*} bld
 * @param {*} code
 * @param {*} s
 * @param {*} ban
 * @param {*} prepare
 * @param {*} acc
 * @param {*} resultFan
 * @returns {boolean} true - разрешить работу, false - запрет работы
 */
function exit(bld, code, s, ban, prepare, acc, resultFan) {
	// Очистка аккумулятора и однократное выключение ВНО (acc.firstCycle - флаг для однократной отработки)
	if (!fnCheck(bld, code, s, ban, prepare)) {
		clear(bld, acc, resultFan, 1, 1, 1, 1, 1)
		return false
	}
	return true
}

/**
 * Разрешить/запретить ВВ
 * Разрешено: обычному складу и комби складу в обычном/холодильном режимах
 * @param {*} bld
 * @param {*} obj
 * @param {*} fanS
 * @param {*} s
 * @param {*} ban
 * @returns {boolean} true разрешить ВВ, false запретить ВВ
 */
function fnCheck(bld, code, s, ban, prepare) {
	// Вычисление причин запрета ВВ
	const reason = fnReason(bld, code, s, ban, prepare)
	// Собираем причины для вывода в сообщение
	const err = reason
		.map((el, i) => (el ? dict[i] : null))
		.filter((el) => el !== null)
		.join('; ')
	console.log(77, 'Условия ВВ не подходят по причине', reason, err)

	// Запретить ВВ
	if (reason.some((el) => el)) {
		consoleTable(reason)
		wrExtra(bld._id, null, 'vent', msgB(bld, 143, `${err}`), 'check')
		return false
	}
	// Разрешить ВВ
	delExtra(bld._id, null, 'vent', 'check')
	return true
}

function fnReason(bld, code, s, ban, prepare) {
	const { extraCO2, am, isCC, isCN, isN, start, secAuto, cFlagFinish, idsS, fan } = prepare
	const alrClosed =
		isExtralrm(bld._id, null, 'alrClosed') ||
		idsS.some((idS) => isExtralrm(bld._id, idS, 'alrClosed'))
	const local =
		isExtralrm(bld._id, null, 'local') || idsS.some((idS) => isExtralrm(bld._id, idS, 'local'))
	return [
		ban,
		!fan.length,
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isN,
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isCN,
		alrClosed,
		local,
		extraCO2?.start,
		code === null,
		!start,
		!secAuto,
		!s?.coolerCombi?.work && code === 'combiCold',
		!cFlagFinish && code === 'combiCold',
		s?.vent?.mode === 'auto' && isCN && !s?.vent?.work,
		s?.vent?.mode === 'auto' && isN && !s?.vent?.work,
	]
}

// Очистка аккумуляторов
function clear(bld, acc, resultFan, ...args) {
	acc.byDura = {}
	acc.byTime = {}
	acc.CC = {}
	resultFan.force.push(false)
	resultFan.stg = null
	args[0] ? delExtra(bld._id, null, 'vent', 'wait') : null
	args[1] ? delExtra(bld._id, null, 'vent', 'work') : null
}

function consoleTable(reason) {
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
				combiNormal: reason[12],
				combiNormal: reason[13],
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
			'combiNormal',
			'Normal',
		]
	)
}

module.exports = { exit }
