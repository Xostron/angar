/**
 * Условие пуска
 * @param {*} bld
 * @param {*} cmpr
 * @param {*} stateAgg
 * @param {*} acc
 * @param {*} pinV
 * @param {*} s
 */
function fnRunning(bld, owner, cmpr, stateAgg, acc, pinV, s) {
	const { pin = 0, hysteresisP = 0.2 } = bld.type === 'cold' ? s.cooler : s.coolerCombi
	// Авария питания, перегрев двигателя, ?
    const { supply, int, pressure } = stateAgg.compressor[cmpr._id].beep
	const alr = supply?.value || int?.value || pressure?.value || acc[owner]?.oil
	// Условие пуска
	// console.log(222, owner, 'Агрегат: Условие пуска', !alr && pinV >= pin + hysteresisP)
	if (!alr && pinV >= pin + hysteresisP) acc[owner].run = true
	// Условие стоп
	// console.log(333, 'Агрегат: Условие стоп', alr || pinV <= pin)
	if (alr || pinV <= pin) acc[owner].run = false
	console.log(3331, 'Агрегат',acc)
}

module.exports = { fnRunning }
