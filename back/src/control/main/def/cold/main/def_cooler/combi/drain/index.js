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
	// время вышло
	if (!time) return
	// Повтор
	if (tmp) return fnChange(0, 0, 1, 0, 'defrost', clr)
	// Ждем пока все испарители не закончат процесс оттайка-слив воды
	acc.state.drainAll = new Date()
	acc.state.add=false
	check.combi(fnChange, 'drain', accCold, acc, se, s, bld, clr)
}

module.exports = drain
