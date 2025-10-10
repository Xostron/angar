/**
 * Условие пуска
 * @param {*} bld
 * @param {*} cmpr
 * @param {*} stateAgg
 * @param {*} acc
 * @param {*} pinV
 * @param {*} s
 */
function fnRunning(bld, cmpr, stateAgg, acc, pinV, s) {
	const { pin = 0, hysteresisP = 0.2 } = bld.type == 'cold' ? s.cooler : s.coolerCombi
	const { supply, int, pressure } = stateAgg.compressor[cmpr._id].beep
	const alr = supply.value || int.value || pressure.value || acc[cmpr._id].oil
	// Условие пуска
	// console.log(
	// 	222,
	// 	'Агрегат: Условие пуска',
	// 	!alr,
	// 	pinV,
	// 	'>=',
	// 	pin,
	// 	'+',
	// 	hysteresisP,
	// 	'=',
	// 	!alr && pinV >= pin + hysteresisP
	// )
	if (!alr && pinV >= pin + hysteresisP) acc[cmpr._id].running = true
	// Условие стоп
	// console.log(333, 'Агрегат: Условие стоп', alr, '||', pinV, '<=', pin, '=', alr || pinV <= pin)
	if (alr || pinV <= pin) acc[cmpr._id].running = false
}

module.exports = { fnRunning }
