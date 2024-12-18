const { compareTime } = require('@tool/command/time');
const onTime = require('../on_time');
const check = require('../check');

// Обдув
function blow(fnChange, acc, se, s, bld) {
	onTime('blow', acc);
	
	// Отсутсвует время включения обдува
	if (!acc.state.blow) {
		console.log('blow', 'Отсутсвует время включения обдува');
		// переход на набор холода
		return check(fnChange, 'blow', acc, se, s, bld);
	}
	
	const off = acc.state.off ?? 0
	const bf = Math.max(acc.state.frost ?? 0, acc.state.cooling ?? 0)
	// console.log('acc.state.off', acc.state.off?.toLocaleString())
	// console.log('acc.state.blow', acc.state.blow?.toLocaleString())
	// console.log('acc.state.frost', acc.state.frost?.toLocaleString())
	// console.log('bf',bf, new Date(bf).toLocaleString())
	// Время обдува (после остановки)
	if (off > bf) {
		// Время обдува не закончилось
		const time = compareTime(acc.state.blow, s.cooler?.blow);
		console.log('blow', 'Время обдува (после остановки)', time);
		if (!time) return;
	}
	return check(fnChange, 'blow', acc, se, s, bld);
}
module.exports = blow;
