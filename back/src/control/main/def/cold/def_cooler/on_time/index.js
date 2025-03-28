const { runTime } = require('@tool/command/time');

// Вычисляет сколько в минут работает в указанном режиме и выводит в консоль
function onTime(code, acc) {
	if (!acc.state[code]) acc.state[code] = new Date();
	console.log('\t'+code, runTime(acc.state[code]));
}

module.exports = onTime;
