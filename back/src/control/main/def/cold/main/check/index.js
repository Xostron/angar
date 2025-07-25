const { onTime } = require('@tool/command/time')
const mes = require('@dict/message')
const { msgB } = require('@tool/message')
const { wrAchieve, delAchieve } = require('@tool/message/achieve')
const { data: store } = require('@store')

// Проверка включения выход/охлаждение/обдув/набор холода
function check(fnChange, code, accAuto, acc, se, s, bld, clr) {
	onTime(code, acc)
	console.log('\n\tПроверка условий принятия решений')
	// Выключение (Температура задания достигнута)
	if (se.tprd <= accAuto.target) {
		wrAchieve(bld._id, bld.type, msgB(bld, 80, `${accAuto.target} °C`))
		delAchieve(bld._id, bld.type, mes[81].code)
		if (code === 'off') return
		console.log(code, `Выключение - тмп. продукта ${se.tprd}<=${accAuto.target} тмп. задания`)
		return fnChange(0, 0, 0, 0, 'off', clr)
	} else {
		delAchieve(bld._id, bld.type, mes[80].code)
		const txt = `Температура задания ${accAuto.target} °C, продукта ${se.tprd} °C`
		wrAchieve(bld._id, bld.type, msgB(bld, 81, txt))
	}

	let sol = ['frost', 'cooling'].includes(code) ? 1 : 0 //Соленоид
	let ven = ['cooling', 'blow'].includes(code) ? 1 : 0 //Вентилятор

	// console.log(
	// 	'\tУсловие',
	// 	1,
	// 	`Соленоид 1. Тмп. помещения ${se.tin} > ${s.cold.room + s.cold.deltaRoom} Целевая тмп. помещения + deltaR(${s.cold.deltaRoom}), r =`,
	// 	se.tin > s.cold.room + s.cold.deltaRoom
	// )
	// console.log('\tУсловие', 2, `Соленоид 0, Тмп. помещения ${se.tin} =< ${s.cold.room} Целевая тмп. помещения, r =`, se.tin <= s.cold.room)
	// console.log(
	// 	'\tУсловие',
	// 	3,
	// 	`Вентилятор 1. Тмп. дт. всасывания ${se.cooler.tmpCooler} < ${s.cooler.cold} Целевой тмп. дт.`,
	// 	se.cooler.tmpCooler <= s.cooler.cold
	// )
	// console.log(
	// 	'\tУсловие',
	// 	4,
	// 	`Вентилятор 0. Тмп. дт. всасывания ${se.cooler.tmpCooler} > ${s.cooler.cold + s.cooler.deltaCold} Целевой тмп. дт. + delta(${
	// 		s.cooler.deltaCold
	// 	})`,
	// 	se.cooler.tmpCooler > s.cooler.cold + s.cooler.deltaCold
	// )

	// условия включения соленоида
	if (se.tin > s.cold.room + s.cold.deltaRoom) sol = 1
	if (se.tin <= s.cold.room) sol = 0

	// Условия включения вентилятора
	if (se.cooler.tmpCooler <= s.cooler.cold) ven = 1
	if (se.cooler.tmpCooler > s.cooler.cold + s.cooler.deltaCold) ven = 0

	// console.log(4441, code, sol, ven);
	// console.log('(!sol && !ven )||(sol && !ven)', (!sol && !ven ), (sol && !ven), (!sol && !ven )||(sol && !ven));
	// console.log('!sol && ven', !sol && ven);

	if ((!sol && !ven) || (sol && !ven)) {
		if (code === 'frost') return
		if (code == 'drain' && !accAuto.drainAll) return
		return fnChange(1, 0, 0, 0, 'frost', clr)
	} else if (!sol && ven) {
		if (code === 'blow') return
		acc.state.frost = new Date()
		return fnChange(0, 1, 0, 0, 'blow', clr)
	} else {
		if (code === 'cooling') return
		return fnChange(1, 1, 0, 0, 'cooling', clr)
	}
}

function checkCombi(fnChange, code, accCold, acc, se, s, bld, clr) {
	onTime(code, acc)
	console.log('\n\tПроверка условий принятия решений')

	// Достиг задания => выкл испаритель
	if (store.alarm.achieve?.[bld._id]?.cooling?.finish) {
		if (code === 'off') return
		return fnChange(0, 0, 0, 0, 'off', clr)
	}

	let ven = ['cooling', 'blow'].includes(code) ? 1 : 0 //Вентилятор
	// let sol = ['frost', 'cooling'].includes(code) ? 1 : 0 //Соленоид

	// условия включения соленоида
	let sol = 1

	// Условия включения вентилятора испарителя
	if (se.cooler.tmpCooler <= s.coolerCombi.cold) ven = 1
	if (se.cooler.tmpCooler > s.coolerCombi.cold + s.coolerCombi.deltaCold) ven = 0

	console.log(666, clr.name, code, sol, ven)

	if ((!sol && !ven) || (sol && !ven)) {
		if (code === 'frost') return
		if (code == 'drain' && !accAuto.drainAll) return
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
