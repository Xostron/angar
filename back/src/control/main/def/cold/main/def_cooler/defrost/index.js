const onTime = require('../on_time');
const { compareTime } = require('@tool/command/time');

// Оттайка
function defrost(fnChange, acc, se, s, bld, clrId) {
	onTime('defrost', acc);
	const time = compareTime(acc.state.defrost, s.cooler.defrostWork);
	const t = se.cooler[clrId].tmpCooler >= s.cooler.defrostOff;
	if (!acc.state.defrost) acc.state.defrost = new Date();
	console.log('defrost', 'time', time, 'tmp', t);
	if (time || t) {
		if (time) console.log('defrost', 'Истекло отведенное время');
		else
			console.log(
				'defrost',
				`Достигнута  целевая тмп.  дт. всасывания ${se.cooler[clrId].tmpCooler} >= ${s.cooler.defrostOff}`
			);
		acc.targetDT = new Date();
		fnChange(0, 0, 0, 1, 'drain');
	}
}

module.exports = defrost;
