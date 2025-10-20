const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Слив конденсата
function drain(fnChange, accCold, acc, se, s, bld, clr) {
	if (!acc.state.drain) acc.state.drain = new Date()
	delete acc?.state?.drainAll
	onTime('drain', acc)
	const time = compareTime(acc.state.drain, s.coolerCombi.water)
	const tmp = se.cooler.tmpCooler <= s?.coolerCombi?.defrostOn
	console.log(7771, 'drain', time, tmp)
	// Время не прошло
	if (!time) return
	// Время прошло -> выключаем слив воды
	acc.state.add = false
	// Время прошло, а температура всасывания не уменьшилась -> повтор оттайки
	if (tmp) {
		// Флаг включения оттайки на всех испарителях
        accCold.defrostAll = new Date()
		return fnChange(0, 0, 1, 0, 'defrost', clr)
	}
	check.combi(fnChange, 'drain', accCold, acc, se, s, bld, clr)
}

module.exports = drain
