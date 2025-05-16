const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Слив конденсата
function drain(fnChange, acc, se, s, bld, clr) {
	if (!acc.state.drain) acc.state.drain = new Date()
	onTime('drain', acc)
	const time = compareTime(acc.state.drain, s.coolerCombi.water)
	const tmp = se.cooler[clr._id].tmpCooler <= s?.coolerCombi?.defrostOn
	console.log('drain', 'time', time, 'tmp', tmp)
	// время вышло
	if (!time) return
	// Повтор
	if (tmp) return fnChange(0, 0, 1, 0, 'defrost',clr)
	check.combi(fnChange, 'drain', acc, se, s, bld, clr)
}

module.exports = drain
