const { data: store, readAcc } = require('@store')
const def = require('@control/main/def/normal/def')
const extralrm = require('@control/extra/extralrm')
const { fnValve } = require('@tool/command/valve/auto')

function auto(bld, sect, obj, s, se, seB, m, am, acc, resultFan, alrBld, alrAm, alrAlw) {
	// Удаление СО2
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	// Таймер запретов - закрываем клапана, выключаем вентиляторы
	let ban = !!store.alarm.timer?.[bld._id]?.[am]

	// Для секции: дополнительные аварии авторежимов (section - on)
	const toAlr = def[am]?.toAlrS(s, sect._id, acc)
	const alrS = extralrm(bld, sect, obj, s, se, m, am, toAlr)

	// const alrClosed = store.alarm?.extralrm?.[bld._id]?.[sect._id]?.alrClosed
	const alrSe = alrSens(se)

	// Сумма аварий: доп. аварии, Авария авторежима, таймер запретов, авария склада
	// const alr = alrS || alrAm || ban || alrBld || alrAlw || alrSe
	const alr = alrS || (alrAm && !extraCO2.start) || ban || alrBld || alrAlw || alrSe

	console.log(
		666,
		sect?.name,
		'alr ' + alr + ' = ',
		alrS,
		'||',
		alrAm,
		'||',
		ban,
		'||',
		alrBld,
		'||',
		alrAlw,
		'||',
		alrSe
	)
	//********** Логика авто **********
	// Пользовательские расчеты
	if (def[am]?.middlew) def[am]?.middlew(bld, sect, obj, s, se, seB, alr, acc)

	// Клапан
	const v = def[am].valve(s, se, sect._id, acc, extraCO2)
	fnValve(v, sect._id, s)

	// Вентилятор
	const f = def[am].fan(s, se, alr, sect._id, acc)
	// Наличие аварии для обратки доп. вентиляции ()
	const notDur = alrS || ban || alrBld || alrAlw || alrSe
	resultFan.start.push(f.start)
	resultFan.notDur.push(notDur)
	// Запись аккумулятора
	const automode = obj.retain?.[bld._id]?.automode
	const t = bld?.type == 'normal' ? automode ?? bld?.type : bld?.type
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
