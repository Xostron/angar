const { fnValve } = require('@tool/command/valve/auto')
const { data: store, rs, isAlr } = require('@store')
const def = require('@control/main/def/normal/def')
const extralrm = require('@control/extra/extralrm')

function auto(building, sect, obj, s, se, seB, m, am, accAuto, resultFan, alrB, alrAlways) {
	// Таймер запретов - закрываем клапана, выключаем вентиляторы
	let ban = !!store.alarm.timer?.[building._id]?.[am]

	// Аварии авторежима
	rs(building._id, sect._id, am, def[am].alarm(s, se, seB, building, sect, accAuto))
	const alrA = isAlr(building._id, sect._id, am)

	// Для секции: дополнительные аварии авторежимов
	const toAlr = def[am]?.toAlrS(s, sect._id, accAuto)
	const alrS = extralrm(building, sect, obj, s, se, m, am, toAlr)
	const alrClosed = store.alarm?.extralrm?.[building._id]?.[sect._id]?.alrClosed
	const alrSe = alrSens(se)
	// Сумма аварий: доп. аварии, Авария авторежима, таймер запретов, авария склада, авария по низкой темпаературе
	const alr = alrS || alrA || ban || alrB || !!alrClosed || alrAlways || alrSe

	// console.log(
	// 	333,'roma',
	// 	sect.name,
	// 	`Авария = ${alr}: alrS - ${alrS} || alrA - ${alrA} || ban - ${ban} || alrB - ${alrB} || !!alrClosed - ${!!alrClosed}`
	// )
	// console.log(
	// 	444,'roma',
	// 	sect.name,
	// 	`Аварии сушки alrA = ${alrA}: ${store.alarm.auto?.[building._id]?.[am]?.[sect._id]}`
	// )
	//********** Логика авто **********
	// Пользовательские расчеты
	if (def[am]?.middlew) def[am]?.middlew(building, sect, s, se, seB, alr, accAuto)

	// Клапан
	const v = def[am].valve(s, se, sect._id, accAuto)
	fnValve(v, sect._id, s)

	// Вентилятор
	const f = def[am].fan(s, se, alr, sect._id, accAuto)
	resultFan.start.push(f.start)
	resultFan.list.push(sect._id)
	resultFan.fan.push(...m.fanS)

	return { alr, v }
}

module.exports = auto


// Авария неисправности основных датчиков true-авария, false - нет аварии
function alrSens(se) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = se
	if (
		typeof tprd !== 'number' ||
		typeof tcnl !== 'number' ||
		typeof tout !== 'number' ||
		typeof hout !== 'number' ||
		typeof hAbsOut !== 'number' ||
		typeof hAbsIn !== 'number'
	)
		return true
	return false
}
