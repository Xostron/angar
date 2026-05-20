const { data: store, readAcc } = require('@store')
const extralrm = require('@control/extra/extralrm')
const { isExtra } = require('@tool/message/extra')

/**
 * Агрегированные аварии по секции
 * @param {*} bld
 * @param {*} sect
 * @param {*} obj
 * @param {*} s
 * @param {*} se
 * @param {*} seB
 * @param {*} m
 * @param {*} am
 * @param {*} acc
 * @param {*} resultFan
 * @param {*} alrBld
 * @param {*} alrAm
 * @param {*} alrAlw
 * @returns {object} {alrS, isCO2work, ban, alrSe, alr, notDur}
 */
function fnAlarm(bld, sect, obj, s, se, seB, m, am, acc, resultFan, alrBld, alrAm, alrAlw) {
	const alrS = extralrm(bld, sect, obj, s, se, m, am, 'section', 'on')
	const isCO2work = isExtra(bld._id, null, 'co2', 'work')
	const ban = !!store.alarm.timer?.[bld._id]?.[am]
	const alrSe = alrSens(se)
	const a = [
		[alrAm && !isCO2work, 'Авария авторежима и СО2 не в работе'],
		[alrAlw, 'Аварии склада в любых режимах'],
		[alrBld, 'Авария склада в авто'],
		[alrSe, 'Аварии датчиков'],
		[ban, 'Таймеры запретов'],
		[alrS, 'Аварии секции'],
	]
	// Сумма аварий
	const alr = a.filter((e) => e[0] === true)?.length !== 0
	// Наличие аварии для обработки доп. вентиляции
	const notDur = alrS || ban || alrBld || alrAlw || alrSe
	console.log(
		'\t',
		'Автоматический режим, сумма аварий',
		sect?.name,
		'alr ',
		alr,
		' = ',
		a.filter((e) => e[0]),
	)
	return { alrS, isCO2work, ban, alrSe, alr, notDur }
}

module.exports = fnAlarm

// Неисправности основных датчиков true-авария, false - нет аварии
function alrSens(se) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = se
	if (typeof tout !== 'number' || typeof hout !== 'number') return true
	return false
}
