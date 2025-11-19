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
	if (se.tprd <= accCold.target && se.hin <= s.mois.humidity) {
		wrAchieve(bld._id, bld.type, msgB(bld, 80, `${accCold.target ?? '--'} °C`))
		delAchieve(bld._id, bld.type, mes[81].code)
		if (code === 'off') return true
		console.log(code, `Выключение - тмп. продукта ${se.tprd}<=${accCold.target} тмп. задания`)
		acc.state.off = new Date()
		// Точка отсчета для обдува датчиков по достижению задания
		if (!accCold.finishTarget) accCold.finishTarget = new Date()
		// Флаг продукт достиг задания для гистерезиса
		accCold.flagFinish = new Date()
		fnChange(0, 0, 0, 0, 'off', clr)
		return true
	}
	// "Температура задания достигнута" ожидаем выход из гистерезиса
	if (accCold.flagFinish && se.tprd <= accCold.target + s.cooling.hysteresisIn) {
		// Точка отсчета для обдува датчиков по достижению задания
		accAuto.finishTarget ??= new Date()
		if (code === 'off') return true
		fnChange(0, 0, 0, 0, 'off', clr)
		return true
	}

	// Сброс "Температура задания достигнута" по гистерезису
	if (accCold.flagFinish && se.tprd > accCold.target + s.cooling.hysteresisIn) {
		accAuto.flagFinish = null
		accAuto.finishTarget = null
		delAchieve(bld._id, bld.type, mes[80].code)
	}
	const txt = `Температура задания ${accCold.target ?? '--'} °C, продукта ${se.tprd} °C`
	wrAchieve(bld._id, bld.type, msgB(bld, 81, txt))
	// Не блокировать
	return false
}

module.exports = combiAchieve
