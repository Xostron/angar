const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const dict = {
	0: 'таймер запрета активен',
	1: 'вентиляторы неисправны',
	2: 'режим вентиляции - Выкл', //обычный склад
	3: 'режим вентиляции - Выкл', //комби-обычный
	4: 'авария низкой температуры',
	5: 'переключатель на щите',
	6: 'работает удаление СО2',
	7: 'не выбран авторежим и(или) продукт, нет настроек',
	8: 'склад выключен',
	9: 'секция не в авто',
	10: 'настройки "Холодильник С": работа внутренней вентиляции = 0',
	11: 'задание продукта еще не достигнуто', //комби-холодильник
	12: 'настройка "Вентиляция": работа внутренней вентиляции = 0', //комби-обычный
	13: 'настройка "Вентиляция": работа внутренней вентиляции = 0', //обычный склад
	14: 'склад работает по авто режиму', //комби-обычный, хранение
	15: 'склад работает по авто режиму', //обычный, хранение
	16: 'склад работает по авто режиму', //комби-обычный, сушка
	17: 'склад работает по авто режиму', //обычный, сушка
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
	if (reason.some((el, i) => el)) {
		// consoleTable(reason)
		console.log(77, reason)
		if (reason[14] || reason[15] || reason[16] || reason[17]) return false
		// Печатаем причиный с 0 по 13
		wrExtra(bld._id, null, 'vent', msgB(bld, 143, `${err}`), 'check')
		return false
	}
	// Разрешить ВВ
	delExtra(bld._id, null, 'vent', 'check')
	return true
}

function fnReason(bld, code, s, ban, prepare) {
	const {
		alrAuto,
		extraCO2,
		am,
		isCC,
		isCN,
		isN,
		start,
		secAuto,
		ccFlagFinish,
		flagFinish,
		idsS,
		fan,
	} = prepare
	const alrClosed =
		isExtralrm(bld._id, null, 'alrClosed') ||
		idsS.some((idS) => isExtralrm(bld._id, idS, 'alrClosed'))
	const local =
		isExtralrm(bld._id, null, 'local') || idsS.some((idS) => isExtralrm(bld._id, idS, 'local'))
	return [
		ban, //0
		!fan.length, //1
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isN, //2
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isCN, //3
		alrClosed, //4
		local, //5
		extraCO2?.start, //6
		code === null, //7
		!start, //8
		!secAuto, //9
		!s?.coolerCombi?.work && code === 'combiCold', //10
		!ccFlagFinish && code === 'combiCold', //11
		s?.vent?.mode === 'auto' && isCN && !s?.vent?.work, //12
		s?.vent?.mode === 'auto' && isN && !s?.vent?.work, //13
		isCN && am === 'cooling' && !flagFinish && !alrAuto, //14
		isN && am === 'cooling' && !flagFinish && !alrAuto, //15
		isCN && am === 'drying' && !alrAuto, //16
		isN && am === 'drying' && !alrAuto, //17
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

// function consoleTable(reason) {
// 	console.table(
// 		[
// 			{
// 				ban: reason[0],
// 				ВНО_0: reason[1],
// 				Выкл_Обыч: reason[2],
// 				Выкл_Комби: reason[3],
// 				alrClosed: reason[4],
// 				local: reason[5],
// 				CО2: reason[6],
// 				def_null: reason[7],
// 				not_start: reason[8],
// 				not_secAuto: reason[9],
// 				combiCold: reason[10],
// 				combiCold2: reason[11],
// 				combiNormal: reason[12],
// 				combiNormal: reason[13],

// 			},
// 		],
// 		[
// 			'ban',
// 			'ВНО_0',
// 			'Выкл_Обыч',
// 			'Выкл_Комби',
// 			'alrClosed',
// 			'local',
// 			'CО2',
// 			'def_null',
// 			'not_start',
// 			'not_secAuto',
// 			'combiCold',
// 			'combiCold2',
// 			'combiNormal',
// 			'Normal',
// 		]
// 	)
// }

module.exports = { exit }
