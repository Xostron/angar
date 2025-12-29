const { compareTime, remTime } = require('@tool/command/time');

// По таймеру
function time(obj, ctrlWet, setMsg) {
	const { status, wetting, run, acc } = obj;
	// проверить состояние напорных вентиляторов
	if (!run) {
		console.log(
			'Увлажнитель (Время): Запуск увлажнителя не возможен. Напорные вентиляторы не работают.'
		);
		ctrlWet(false, 'По причине: Напорные вентиляторы не работают.');
		return;
	}

	console.log('acc.stop', acc.stop, acc.stop?.toLocaleString());
	console.log('acc.work', acc.work, acc.work?.toLocaleString());
	// Увлажнитель еще не запускался, нет времени запуска
	if (!acc.work && !acc.stop) {
		console.log(
			'Увлажнитель (Время): Увлажнитель еще не запускался. Начинаем с ожидания'
		);
		ctrlWet(false);
		return;
	}

	// Запущен, но время работы увлажнителя истекло
	if (status && acc.work && compareTime(acc.work, wetting.work)) {
		console.log(
			'Увлажнитель (Время): Время работы увлажнителя истекло. Выключаем',
			new Date().toLocaleString()
		);
		ctrlWet(false);
		return;
	}
	// Выключен, но время простоя увлажнителя истекло
	if (!status && compareTime(acc.stop, wetting.stop)) {
		console.log(
			'Увлажнитель (Время): Время простоя увлажнителя истекло. Запускаем',
			new Date().toLocaleString()
		);
		ctrlWet(true);
		return;
	}
	console.log(
		'Увлажнитель (Время): Время работы или простоя увлажнителя не истекло. Ничего не делаем. Время работы:' +
			acc.work?.toLocaleString() +
			' Время простоя: ' +
			acc.stop?.toLocaleString()
	);

	if (acc.work && !compareTime(acc.work, wetting.work)) {
		setMsg(135, 'run', `Осталось ${remTime(acc.work, wetting.work)}`);
	} else if (acc.stop && !compareTime(acc.stop, wetting.stop)) {
		setMsg(136, 'stop', `Осталось ${remTime(acc.stop, wetting.stop)}`);
	}
}

module.exports = time;
