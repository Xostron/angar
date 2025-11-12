/**
 * Условие пуска
 * @param {*} bld
 * @param {*} cmpr
 * @param {*} stateAgg
 * @param {*} acc
 * @param {*} pinV
 * @param {*} s
 */
function fnRunning(agg, bld, owner, cmpr, stateAgg, acc, pinV, obj, s) {
	const { pin = 0, hysteresisP = 0.2 } = bld.type === 'cold' ? s.cooler : s.coolerCombi
	// Авария питания, перегрев двигателя, высокое давление, уровень масла
	const alarm = stateAgg.state === 'alarm'
	// Условие пуска
	console.log(
		'\tАгрегат: Условие пуска',
		!alarm && pinV.value >= pin + hysteresisP,
		'!alarm',
		!alarm,
		'формула =',
		pinV,
		'>=',
		pin,
		hysteresisP
	)
	if (pinV.state === 'on' && !alarm && pinV.value >= pin + hysteresisP) acc[owner].run = true
	// Условие стоп:
	// Авария модулей
	// const alrM = isAlrM(agg, obj, acc)
	// Реле низкого давления
	const relay = acc?.[owner]?.relay
	console.log(
		'\tАгрегат: Условие стоп',
		'pinV.state=',
		pinV.state,
		'alr',
		alarm,
		'pinV <= pin',
		pinV.value <= pin,
		'relay',
		relay
	)
	if (pinV.state !== 'on' || alarm || pinV.value <= pin || relay) acc[owner].run = false
}

module.exports = { fnRunning }
