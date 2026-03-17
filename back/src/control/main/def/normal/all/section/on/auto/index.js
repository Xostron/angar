const { data: store, readAcc } = require('@store')
const def = require('@control/main/def/normal/def')
const extralrm = require('@control/extra/extralrm')
const { fnValve } = require('@tool/command/valve/auto')
const { isExtra } = require('@tool/message/extra')

function auto(bld, sect, obj, s, se, seB, m, am, acc, resultFan, alrBld, alrAm, alrAlw) {
	// Удаление СО2
	// const extraCO2 = readAcc(bld._id, 'building', 'co2')
	// Удаление co2 в работе
	const isCO2work = isExtra(bld._id, null, 'co2', 'work')
	// Таймер запретов - закрываем клапана, выключаем вентиляторы
	let ban = !!store.alarm.timer?.[bld._id]?.[am]

	// Для секции: дополнительные аварии авторежимов (section - on)
	const toAlr = def[am]?.toAlrS(s, sect._id, acc)
	const alrS = extralrm(bld, sect, obj, s, se, m, am, toAlr)

	const alrSe = alrSens(se)
	const a = [
		[alrS, 'Доп. аварии. для секции'],
		[alrAm && !isCO2work, 'Авария авторежима', 'alrAm:', alrAm, '!isCO2work:', !isCO2work],
		[ban, 'таймер запретов'],
		[alrBld, 'авария склада'],
		[alrAlw, 'alrAlw'],
		[alrSe, 'alrSe'],
	]
	// Сумма аварий: доп. аварии, Авария авторежима, таймер запретов, авария склада
	const alr = a.filter((e) => e[0] === true)?.length !== 0
	console.log(
		'\t',
		'Автоматический режим, сумма аварий',
		sect?.name,
		'alr ',
		alr,
		' = ',
		a.filter((e) => e[0]),
	)

	//********** Логика авто **********
	// Пользовательские расчеты
	if (def[am]?.middlew) def[am]?.middlew(bld, sect, obj, s, se, seB, alr, acc)

	// Клапан
	const v = def[am].valve(bld, sect._id, obj, m, s, se, am, acc, isCO2work, alr)
	fnValve(v, sect._id, s)

	// Вентилятор
	const f = def[am].fan(s, se, alr, sect._id, acc)
	// Наличие аварии для обратки доп. вентиляции ()
	const notDur = alrS || ban || alrBld || alrAlw || alrSe
	resultFan.start.push(f.start)
	resultFan.notDur.push(notDur)
	// Запись аккумулятора
	const automode = obj.retain?.[bld._id]?.automode
	const t = bld?.type == 'normal' ? (automode ?? bld?.type) : bld?.type
	store.acc[bld._id][t] = { ...acc }
	return { alr, v }
}

module.exports = auto

// Неисправности основных датчиков true-авария, false - нет аварии
function alrSens(se) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = se
	if (typeof tout !== 'number' || typeof hout !== 'number') return true
	return false
}
