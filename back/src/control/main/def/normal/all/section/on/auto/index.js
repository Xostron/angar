const { data: store } = require('@store')
const def = require('@control/main/def/normal/def')
const extralrm = require('@control/extra/extralrm')
const { fnValve } = require('@tool/command/valve/auto')

function auto(building, sect, obj, s, se, seB, m, am, acc, resultFan, alrBld, alrAm, alrAlw) {
	// Таймер запретов - закрываем клапана, выключаем вентиляторы
	let ban = !!store.alarm.timer?.[building._id]?.[am]

	// Для секции: дополнительные аварии авторежимов (section - on)
	const toAlr = def[am]?.toAlrS(s, sect._id, acc)
	const alrS = extralrm(building, sect, obj, s, se, m, am, toAlr)

	// const alrClosed = store.alarm?.extralrm?.[building._id]?.[sect._id]?.alrClosed
	const alrSe = alrSens(se)

	// Сумма аварий: доп. аварии, Авария авторежима, таймер запретов, авария склада, авария по низкой темпаературе
	const alr = alrS || alrAm || ban || alrBld || alrAlw || alrSe //|| !!alrClosed
	// console.log(666, sect?.name, 'alr = ' + alr + ' = ', alrS, '||', alrAm, '||', ban, '||', alrBld, '||', '||', alrAlw, '||', alrSe)
	//********** Логика авто **********
	// Пользовательские расчеты
	if (def[am]?.middlew) def[am]?.middlew(building, sect, obj, s, se, seB, alr, acc)

	// Клапан
	const v = def[am].valve(s, se, sect._id, acc)
	fnValve(v, sect._id, s)

	// Вентилятор
	const f = def[am].fan(s, se, alr, sect._id, acc)
	resultFan.start.push(f.start)
	resultFan.list.push(sect._id)
	resultFan.fan.push(...m.fanS)
	// Запись аккумулятора
	const automode = obj.retain?.[building._id]?.automode
	const t = building?.type == 'normal' ? automode ?? building?.type : building?.type
	store.acc[building._id][t] = { ...acc }
	return { alr, v }
}

module.exports = auto

// Авария неисправности основных датчиков true-авария, false - нет аварии
function alrSens(se) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = se
	if (typeof tout !== 'number' || typeof hout !== 'number') return true
	return false
}
