const mes = require('@dict/message')
const { msgB } = require('@tool/message')
const { wrAchieve, delAchieve } = require('@tool/message/achieve')
const { data: store } = require('@store')

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
	// "Температура задания достигнута"
	// console.log(
	// 	1100,
	// 	se.tprd,
	// 	accCold.tgtTprd,
	// 	se.hin,
	// 	s.mois.humidity,
	// 	se.tprd <= accCold.tgtTprd && se.hin <= s.mois.humidity,
	// 	s.cooling.hysteresisIn,
	// 	bld._id,
	// 	bld.type,
	// 	store.alarm.achieve?.[bld._id]?.[bld.type]
	// )
	// console.log(11000, se.tprd, accCold.tgtTprd, se.tprd <= accCold.tgtTprd)
	if (se.tprd <= accCold.tgtTprd && se.hin <= s.mois.humidity) {
		delAchieve(bld._id, bld.type, mes[81].code)
		wrAchieve(bld._id, bld.type, msgB(bld, 80, `${accCold.tgtTprd ?? '--'} °C`))
		// Точка отсчета для обдува датчиков по достижению задания
		accCold.finishTarget ??= new Date()
		// accCold.blow ??= new Date()
		acc.state.off = new Date()
		console.log(11001, code, `Продукт достиг темп задания`)
		if (code === 'off') return true
		// Флаг продукт достиг задания для гистерезиса
		accCold.flagFinish = new Date()
		fnChange(0, 0, 0, 0, 'off', clr)
		return true
	}
	// "Температура задания достигнута" ожидаем выход из гистерезиса
	if (accCold.flagFinish && se.tprd <= accCold.tgtTprd + s.cooling.hysteresisIn) {
		console.log(2200, 'Температура задания достигнута ожидаем выход из гистерезиса')
		// Точка отсчета для обдува датчиков по достижению задания
		accCold.finishTarget ??= new Date()
		// accCold.blow ??= new Date()
		acc.state.off = new Date()
		if (code === 'off') return true
		fnChange(0, 0, 0, 0, 'off', clr)
		return true
	}
	// Сброс "Температура задания достигнута" по гистерезису
	if (accCold.flagFinish && se.tprd > accCold.tgtTprd + s.cooling.hysteresisIn) {
		accCold.flagFinish = null
		accCold.finishTarget = null
		// accCold.blow = null
		delAchieve(bld._id, bld.type, mes[80].code)
	}
	const txt = `Tзад.канала = ${accCold.tgtTcnl ?? '--'} (${se.tcnl ?? '--'})°C. 
	Тзад.прод. = ${accCold.tgtTprd ?? '--'} (${se.tprd ?? '--'})°C, 
	Влажность = ${s?.mois?.humidity ?? '--'} 
	(${se.hin ?? '--'})%`
	wrAchieve(bld._id, bld.type, msgB(bld, 81, txt))
	// Не блокировать
	return false
}

module.exports = combiAchieve
