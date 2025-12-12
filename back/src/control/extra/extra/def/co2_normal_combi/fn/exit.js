const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra, wrExtra, isExtra } = require('@tool/message/extra')
const { msgB } = require('@tool/message')
const dict = {
	0: 'таймер запрета активен',
	1: 'вентиляторы неисправны',
	2: 'клапаны не закрыты',
	3: 'секция не в авто',
	4: 'авария низкой температуры',
	5: 'переключатель на щите',
	6: 'склад выключен',
	7: 'настройка "Удаление СО2": Время ожидания = 0',
	8: 'настройка "Удаление СО2": Время работы = 0',
	9: 'склад работает по авто режиму', //комби-обычный
	10: 'склад работает по авто режиму', //обычный
	11: 'склад работает в режиме комби-холодильника',
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
	if (code === 'off' || !fnCheck(bld, code, s, ban, acc, prepare)) {
		clear(bld, acc, resultFan, 1, 1, 1, 1, 1)
		return false
	}
	return true
}

/**
 * Разрешить/запретить
 * Разрешено: обычному складу и комби складу в обычном/холодильном режимах
 * @param {*} bld
 * @param {*} obj
 * @param {*} fanS
 * @param {*} s
 * @param {*} ban
 * @returns {boolean} true разрешить ВВ, false запретить ВВ
 */
function fnCheck(bld, code, s, ban, acc, prepare) {
	// Вычисление причин запрета
	const reason = fnReason(bld, code, s, ban, acc, prepare)
	// Собираем причины для вывода в сообщение, кроме ignore
	const ignore = [9, 10]
	const err = reason
		.map((el, i) => (el && !ignore.includes(i) ? dict[i] : null))
		.filter((el) => el !== null)
		.join('; ')
	console.log(88, 'Условия CO2 не подходят по причине', reason, err)

	// Запретить
	if (reason.some((el, i) => el)) {
		// Печатаем причины
		if (!err) {
			delExtra(bld._id, null, 'co2', 'check')
			return false
		}
		wrExtra(bld._id, null, 'co2', msgB(bld, 86, `${err}`), 'check')
		return false
	}
	// Разрешить ВВ
	delExtra(bld._id, null, 'co2', 'check')
	return true
}

// Вычисление причин выключения "Удаления СО2"
function fnReason(bld, code, s, ban, acc, prepare) {
	const {
		am,
		alrAuto,
		isCC,
		isCN,
		isN,
		start,
		ccFlagFinish,
		flagFinish,
		idsS,
		vlvClosed,
		fan,
		point,
		tprd,
		co2,
		hout,
		isHout,
		validSe,
	} = prepare
	const alrClosed =
		isExtralrm(bld._id, null, 'alrClosed') ||
		idsS.some((idS) => isExtralrm(bld._id, idS, 'alrClosed'))
	const local =
		isExtralrm(bld._id, null, 'local') || idsS.some((idS) => isExtralrm(bld._id, idS, 'local'))
	// CO2 запущен
	const isRunCO2 =
		acc?.byTime?.work ||
		acc?.bySensor?.work ||
		isExtra(bld._id, null, 'co2', 'work') ||
		isExtra(bld._id, null, 'co2', 'on')
	return [
		ban, //0
		!fan.length, //1
		!vlvClosed && !isRunCO2, //2
		!idsS, //3
		alrClosed, //4
		local, //5
		!start, //6
		false && (isCN || isN) && !s?.co2?.wait, //7
		false && (isCN || isN) && !s?.co2?.work, //8
		isCN && !alrAuto && !flagFinish, //9
		isN && !alrAuto && !flagFinish, //10
		isCC, //11
	]
}

// Очистка аккумуляторов
function clear(bld, acc, resultFan, ...args) {
	acc.byTime = {}
	acc.bySensor = {}
	acc.byOn = {}
	resultFan.force.push(false)
	resultFan.stg.push(null)
	args[0] ? delExtra(bld._id, null, 'co2', 'wait') : null
	args[1] ? delExtra(bld._id, null, 'co2', 'work') : null
	args[2] ? delExtra(bld._id, null, 'co2', 'on') : null
}

// Очистка аккумулятора, инициализация
const defClear = {
	on(bld, acc) {
		acc.byOn ??= {}
		acc.byTime = {}
		acc.bySensor = {}
		delExtra(bld._id, null, 'co2', 'wait')
	},
	time(bld, acc) {
		acc.byTime ??= {}
		acc.bySensor = {}
		acc.byOn = {}
		delExtra(bld._id, null, 'co2', 'on')
	},
	sensor(bld, acc) {
		acc.bySensor ??= {}
		acc.byTime = {}
		acc.byOn = {}
		delExtra(bld._id, null, 'co2', 'wait')
		delExtra(bld._id, null, 'co2', 'on')
	},
}

module.exports = { exit, clear, defClear }
