const check = require('../check');
const onTime = require('../on_time');
const { compareTime } = require('@tool/command/time');

// Слив конденсата
function drain(fnChange, acc, se, s, bld) {
	if (!acc.state.drain) acc.state.drain = new Date();
	onTime('drain', acc);
	const time = compareTime(acc.state.drain, s.cooler.water);
	const tmp = se.cooler.clr <= s?.cooler?.defrostOn;
	console.log('drain', 'time', time, 'tmp', tmp);
	// время вышло
	if (!time) return;
	// Повтор
	if (tmp) return fnChange(0, 0, 1, 0, 'defrost');
	check(fnChange, 'drain', acc, se, s, bld);
}

module.exports = drain;
