const { isExtralrm, isAlrClosed } = require('@tool/message/extralrm')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const dict = {
	0: 'таймер запрета', //обычный склад, комби-обычный
	1: 'вентиляторы неисправны',
	2: 'режим вентиляции - Выкл', //обычный склад
	3: 'режим вентиляции - Выкл', //комби-обычный
	4: 'переключатель на щите',
	5: 'работает удаление СО2',
	6: 'не выбран авторежим и(или) продукт, нет настроек',
	7: 'склад выключен',
	8: 'секция не в авто',
	9: 'задание продукта еще не достигнуто', //комби-холодильник
	10: 'настройка "Вентиляция": работа внутренней вентиляции = 0', //комби-обычный
	11: 'настройка "Вентиляция": работа внутренней вентиляции = 0', //обычный склад
	12: 'склад работает по авто режиму', //комби-обычный, хранение
	13: 'склад работает по авто режиму', //обычный, хранение
	14: 'склад работает по авто режиму', //комби-обычный, сушка
	15: 'склад работает по авто режиму', //обычный, сушка
	16: 'настройка "Вентиляция": количество вентиляторов = 0', //обычный, комби-обычный
	17: 'обнаружена авария',
	// 18: 'Низкая температура канала',
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
function exit(bld, obj, code, s, alarm, ban, prepare, acc, resultFan) {
	// Очистка аккумулятора и однократное выключение ВНО (acc.firstCycle - флаг для однократной отработки)
	if (!fnCheck(bld, obj, code, s, alarm, ban, prepare)) {
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
function fnCheck(bld, obj, code, s, alarm, ban, prepare) {
	// Вычисление причин запрета ВВ
	const reason = fnReason(bld, obj, code, s, alarm, ban, prepare)
	// Собираем причины для вывода в сообщение, кроме ignore
	const ignore = [2, 3, 13, 14, 15, 16]
	const err = reason
		.map((el, i) => (el && !ignore.includes(i) ? dict[i] : null))
		.filter((el) => el !== null)
		.join('; ')
	// console.log(77, 'Условия ВВ не подходят по причине', reason, err)

	// Запретить ВВ
	if (reason.some((el, i) => el)) {
		if (!err) {
			// Нет причин для печати
			delExtra(bld._id, null, 'vent', 'check')
			return false
		}
		// Печатаем причины
		wrExtra(bld._id, null, 'vent', msgB(bld, 143, `${err}`), 'check')
		return false
	}
	// Разрешить ВВ
	delExtra(bld._id, null, 'vent', 'check')
	return true
}

function fnReason(bld, obj, code, s, alarm, ban, prepare) {
	const {
		alrAuto,
		CO2work,
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
	// const alrClosed = isAlrClosed(bld, obj)
	const local =
		isExtralrm(bld._id, null, 'local') || idsS.some((idS) => isExtralrm(bld._id, idS, 'local'))
	const supply =
		isExtralrm(bld._id, null, 'supply') ||
		idsS.some((idS) => isExtralrm(bld._id, idS, 'supply')) ||
		isExtralrm(bld._id, null, 'battery')
	return [
		ban && code !== 'combiCold', //0
		!fan.length, //1
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isN, //2
		(!s?.vent?.mode || s?.vent?.mode === 'off') && isCN, //3
		// alrClosed, //4
		local, //5
		CO2work, //6
		code === null, //7
		!start, //8
		!secAuto, //9
		!ccFlagFinish && code === 'combiCold', //10
		s?.vent?.mode === 'auto' && isCN && !s?.vent?.work, //11
		s?.vent?.mode === 'auto' && isN && !s?.vent?.work, //12
		isCN && am === 'cooling' && !flagFinish && !alrAuto, //13
		isN && am === 'cooling' && !flagFinish && !alrAuto, //14
		isCN && am === 'drying' && !alrAuto, //15
		isN && am === 'drying' && !alrAuto, //16
		(isCN || isN) && !s?.vent?.max, // 17
		alarm || supply,
	]
}

// Очистка аккумуляторов
function clear(bld, acc, resultFan, ...args) {
	acc.byTime = {}
	acc.CC = {}
	resultFan.force.push(false)
	resultFan.stg.push(null)
	args[0] ? delExtra(bld._id, null, 'vent', 'wait') : null
	args[1] ? delExtra(bld._id, null, 'vent', 'work') : null
	args[2] ? delExtra(bld._id, null, 'vent', 'ventOn') : null
}

module.exports = { exit }
