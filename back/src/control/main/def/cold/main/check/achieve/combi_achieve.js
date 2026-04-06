const mes = require('@dict/message')
const { msgB } = require('@tool/message')
const { wrAchieve, delAchieve } = require('@tool/message/achieve')
const { data: store } = require('@store')
const { remTime } = require('@tool/command/time')

/**
 * Склад холодильник, комби в режиме холодильника
 * Температура продукта достигла задания
 * @param {*} fnChange
 * @param {*} code
 * @param {*} accAuto
 * @param {*} acc
 * @param {*} se
 * @param {*} s
 * @param {*} bld
 * @param {*} clr
 * @returns true - достиг задания, заблокировать дальнейшее выполнение
 * 			false - не блокировать
 */
function combiAchieve(fnChange, code, accCold, acc, se, s, bld, clr) {
	console.log(16)
	// "Температура задания достигнута"
	if (
		accCold.tgtTprd !== null &&
		se.tprd <= accCold.tgtTprd &&
		se.hin <= s.mois.humidity &&
		accCold.timeAD === null
	) {
		delAchieve(bld._id, bld.type, mes[81].code)
		wrAchieve(
			bld._id,
			bld.type,
			msgB(
				bld,
				80,
				`${accCold.tgtTprd?.toFixed(1) ?? '--'} °C. Зад. влажности = ${s?.mois?.humidity ?? '--'}`,
			),
		)
		// Точка отсчета для обдува датчиков по достижению задания
		accCold.finishTarget ??= new Date()
		// accCold.blow ??= new Date()
		acc.state.off = new Date()
		accCold.flagFinish ??= new Date()
		if (code === 'off') return true
		// Флаг продукт достиг задания для гистерезиса
		fnChange(0, 0, 0, 0, 'off', clr)
		return true
	}
	// "Температура задания достигнута" ожидаем выход из гистерезиса
	if (
		accCold.tgtTprd !== null &&
		accCold.flagFinish &&
		se.tprd <= accCold.tgtTprd + s.cooling.hysteresisIn &&
		se.hin <= s?.mois?.humidity
	) {
		// Точка отсчета для обдува датчиков по достижению задания
		accCold.finishTarget ??= new Date()
		// accCold.blow ??= new Date()
		acc.state.off = new Date()
		if (code === 'off') return true
		fnChange(0, 0, 0, 0, 'off', clr)
		return true
	}
	// Сброс "Температура задания достигнута" по гистерезису
	if (
		(accCold.flagFinish &&
			(se.tprd > accCold.tgtTprd + s.cooling.hysteresisIn || se.hin > s?.mois?.humidity)) ||
		accCold.tgtTprd === null
	) {
		accCold.flagFinish = null
		accCold.finishTarget = null
		delAchieve(bld._id, bld.type, mes[80].code)
	}

	// Не блокировать
	return false
}

/**
 * Склад холодильник, комби в режиме холодильника
 * Температура продукта достигла задания
 * @param {*} fnChange
 * @param {*} code
 * @param {*} accCold
 * @param {*} acc
 * @param {*} se
 * @param {*} s
 * @param {*} bld
 * @param {*} clr
 */
function combiAchieveHeat(fnChange, code, accCold, acc, se, s, bld, clr) {
	// "Температура задания достигнута"
	// console.log(
	// 	17,
	// 	se.tprd,
	// 	'>=',
	// 	accCold.tgtTprd,
	// 	'&&',
	// 	se.hin,
	// 	'<=',
	// 	s.mois.humidity,
	// 	'&&',
	// 	accCold.timeAD === null,
	// 	se.tprd >= accCold.tgtTprd && se.hin <= s.mois.humidity && accCold.timeAD === null,
	// )
	// console.log(
	// 	18,
	// 	accCold.flagFinish &&
	// 		se.tprd >= accCold.tgtTprd - s.cooling.hysteresisIn &&
	// 		se.hin <= s?.mois?.humidity,
	// )

	if (
		accCold.tgtTprd !== null &&
		se.tprd >= accCold.tgtTprd &&
		se.hin <= s.mois.humidity &&
		accCold.timeAD === null
	) {
		console.log(17)
		delAchieve(bld._id, bld.type, mes[81].code)
		wrAchieve(
			bld._id,
			bld.type,
			msgB(
				bld,
				80,
				`${accCold.tgtTprd?.toFixed(1) ?? '--'} °C. Зад. влажности = ${s?.mois?.humidity ?? '--'}`,
			),
		)
		// Точка отсчета для обдува датчиков по достижению задания
		accCold.finishTarget ??= new Date()
		// accCold.blow ??= new Date()
		acc.state.off = new Date()
		accCold.flagFinish ??= new Date()
		if (code === 'off') return true
		// Флаг продукт достиг задания для гистерезиса
		fnChange(0, 0, 0, 0, 'off', clr)
		return true
	}
	// "Температура задания достигнута" ожидаем выход из гистерезиса
	if (
		accCold.tgtTprd !== null &&
		accCold.flagFinish &&
		se.tprd >= accCold.tgtTprd - s.cooling.hysteresisIn &&
		se.hin <= s?.mois?.humidity
	) {
		// Точка отсчета для обдува датчиков по достижению задания
		accCold.finishTarget ??= new Date()
		// accCold.blow ??= new Date()
		acc.state.off = new Date()
		if (code === 'off') return true
		fnChange(0, 0, 0, 0, 'off', clr)
		return true
	}
	// Сброс "Температура задания достигнута" по гистерезису
	if (
		(accCold.flagFinish &&
			(se.tprd < accCold.tgtTprd + s.cooling.hysteresisIn || se.hin > s?.mois?.humidity)) ||
		accCold.tgtTprd === null
	) {
		accCold.flagFinish = null
		accCold.finishTarget = null
		delAchieve(bld._id, bld.type, mes[80].code)
	}
	// Не блокировать
	return false
}

module.exports = { combiAchieve, combiAchieveHeat }
