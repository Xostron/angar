const { compareTime, onTime } = require('@tool/command/time')

// Оттайка
function defrost(fnChange, accAuto, acc, se, s, bld, clr) {
	onTime('defrost', acc)
	const time = compareTime(acc.state.defrost, s.cooler.defrostWork)
	const t = se.cooler.tmpCooler >= s.cooler.defrostOff
	if (!acc.state.defrost) acc.state.defrost = new Date()
	console.log('defrost', 'time', time, 'tmp', t)
	if (time || t) {
		if (time) console.log('defrost', 'Истекло отведенное время')
		else console.log('defrost', `Достигнута  целевая тмп.  дт. всасывания ${se.cooler.tmpCooler} >= ${s.cooler.defrostOff}`)
		accAuto.targetDT = new Date()
		fnChange(0, 0, 0, 1, 'drain', clr)
	}
}

module.exports = defrost
