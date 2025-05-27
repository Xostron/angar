const { compareTime, onTime } = require('@tool/command/time');
const check = require('../../../check');

// Слив конденсата
function drain(fnChange, accAuto, acc, se, s, bld, clr) {
	if (!acc.state.drain) acc.state.drain = new Date();
	delete acc.state.drainAll
	onTime('drain', acc);
	const time = compareTime(acc.state.drain, s.cooler.water);
	const tmp = se.cooler.tmpCooler <= s?.cooler?.defrostOn;
	console.log(4443, 'drain', 'time', time, 'tmp', tmp);
	// время не окончено
	if (!time) return;
	// Повтор
	if (tmp) return fnChange(0, 0, 1, 0, 'defrost');
	// Ждем пока все испарители не закончат процесс оттайка-слив воды
	acc.state.drainAll = true
	check.cold(fnChange, 'drain', accAuto, acc, se, s, bld, clr);
}

module.exports = drain;
