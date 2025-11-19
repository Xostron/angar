const { onTime } = require('@tool/command/time')
const coldAchieve = require('./cold')
const combiAchieve = require('./combi')

// Проверка включения выход/охлаждение/обдув/набор холода
function check(fnChange, code, accAuto, acc, se, s, bld, clr) {
	onTime(code, acc)
	console.log('\n\tПроверка условий принятия решений, tprd =', se.tprd, 'target=', accAuto.target)
	if (coldAchieve(fnChange, code, accAuto, acc, se, s, bld, clr)) return
	let sol = ['frost', 'cooling'].includes(code) ? 1 : 0 //Соленоид
	let ven = ['cooling', 'blow'].includes(code) ? 1 : 0 //Вентилятор

	// условия включения соленоида
	if (se.tin > s.cold.room + s.cold.deltaRoom) sol = 1
	if (se.tin <= s.cold.room) sol = 0

	// Условия включения вентилятора
	if (se.cooler.tmpCooler <= s.cooler.cold) ven = 1
	if (se.cooler.tmpCooler > s.cooler.cold + s.cooler.deltaCold) ven = 0

	if ((!sol && !ven) || (sol && !ven)) {
		if (code === 'frost') return
		if (code === 'drain' && !accAuto.drainAll) return
		return fnChange(1, 0, 0, 0, 'frost', clr)
	} else if (!sol && ven) {
		if (code === 'blow') return
		acc.state.frost = new Date()
		return fnChange(0, 1, 0, 0, 'blow', clr)
	} else {
		// if (code === 'cooling') return
		return fnChange(1, 1, 0, 0, 'cooling', clr)
	}
}

function checkCombi(fnChange, code, accCold, acc, se, s, bld, clr) {
	onTime(code, acc)
	console.log(
		'\n\tПроверка условий принятия решений, tprd =',
		se.tprd,
		'target=',
		accCold.tgtTprd
	)

	if (combiAchieve(fnChange, code, accCold, acc, se, s, bld, clr)) return

	let ven = ['cooling', 'blow'].includes(code) ? 1 : 0 //Вентилятор
	// let sol = ['frost', 'cooling'].includes(code) ? 1 : 0 //Соленоид
	// условия включения соленоида
	let sol = 1

	// Вкл испаритель + включенный соленоид => Охлаждение
	if (se.cooler.tmpCooler <= s.coolerCombi.cold) ven = 1
	// Выкл испаритель => набор холода
	if (se.cooler.tmpCooler > s.coolerCombi.cold + s.coolerCombi.deltaCold) ven = 0

	if ((!sol && !ven) || (sol && !ven)) {
		if (code === 'frost') return
		if (code === 'drain' && !accCold?.drainAll) return
		return fnChange(1, 0, 0, 0, 'frost', clr)
	} else if (!sol && ven) {
		if (code === 'blow') return
		acc.state.frost = new Date()
		return fnChange(0, 1, 0, 0, 'blow', clr)
	} else {
		//TODO if (code === 'cooling') return
		return fnChange(1, 1, 0, 0, 'cooling', clr)
	}
}

module.exports = { cold: check, combi: checkCombi }
