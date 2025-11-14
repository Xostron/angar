const { compareTime, onTime } = require('@tool/command/time')
const check = require('../../../check')

// Слив конденсата
function drain(fnChange, accAuto, acc, se, s, bld, clr) {
	if (!acc.state.drain) acc.state.drain = new Date()
	delete acc?.state?.off
	delete acc.state.drainAll
	onTime('drain', acc)
	const time = compareTime(acc.state.drain, s.cooler.water)
	const tmp = se.cooler.tmpCooler <= s?.cooler?.defrostOn
	console.log('\tdrain time=', time, 'tmp=', tmp, 'Продолжительность = ', s.cooler.water / 1000)
	// время не окончено
	if (!time) return
	// Время прошло -> выключаем слив воды
	acc.state.add = false
	// Время прошло, а температура всасывания не уменьшилась -> повтор оттайки
	if (tmp) {
		// Флаг включения оттайки на всех испарителях
		accAuto.defrostAll = new Date()
		return fnChange(0, 0, 1, 0, 'defrost', clr)
	}
	check.cold(fnChange, 'drain', accAuto, acc, se, s, bld, clr)
}

module.exports = drain
