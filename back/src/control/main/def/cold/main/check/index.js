const { onTime } = require('@tool/command/time')
const coldAchieve = require('./achieve/cold_achieve')
const def = require('./achieve/combi_achieve')
const sm = require('@dict/submode')
const { readAcc } = require('@store/index')

// check - позволяет испарителю не зациклиться на каком-то одном режиме
// он дает испарителю выбор действий.

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
		'\n\t',
		5554,
		'Проверка условий принятия решений, tprd =',
		se.tprd,
		'target=',
		accCold.tgtTprd,
	)

	// Проверка достижения combiAchieve
	// 12. Режим хранения(нагрев)
	let t = bld?.type === 'normal' ? (automode ?? bld?.type) : bld?.type
	const accAuto = readAcc(bld._id, t)
	t = accAuto.submode?.[0] === sm.heat[0] ? 'combiAchieveHeat' : 'combiAchieve'
	console.log(9999, t, accAuto.submode?.[0])
	if (accAuto.submode?.[0] && def[t](fnChange, code, accCold, acc, se, s, bld, clr)) return console.log(9998, "ДОСТИГНУТА")

	let ven = ['cooling', 'blow'].includes(code) ? 1 : 0 //Вентилятор
	// let sol = ['frost', 'cooling'].includes(code) ? 1 : 0 //Соленоид
	// условия включения соленоида
	let sol = 1

	// Вкл испаритель + включенный соленоид => Охлаждение
	if (se.cooler.tmpCooler <= s.coolerCombi.cold) ven = 1
	// Выкл испаритель => набор холода
	if (
		se.cooler.tmpCooler !== null &&
		se.cooler.tmpCooler > s.coolerCombi.cold + s.coolerCombi.deltaCold
	)
		ven = 0

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
