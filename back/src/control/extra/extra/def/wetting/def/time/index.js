const { delExtra, wrExtra } = require('@tool/message/extra');
const { msg } = require('@tool/message');
const { compareTime } = require('@tool/command/time');

// По таймеру
function time(obj, ctrlWet) {
	const { status, wetting, run, bld, sect, acc } = obj;
	// проверить состояние напорных вентиляторов
	// console.log('Увлажнитель (Время): ', wetting);
	const error = [];
	if (!run) {
		console.log(
			'Увлажнитель (Время): Запуск увлажнителя не возможен. Напорные вентиляторы не работают.'
		);
		wrExtra(
			bld._id,
			sect._id,
			'wetting',
			msg(bld, sect, 135, 'Напорные вентиляторы не работают.'),
			'info1'
		);
		if (status) ctrlWet(false);
		return;
	} else delExtra(bld._id, sect._id, 'wetting', 'info1');

	console.log('acc.stop', acc.stop, acc.stop?.toLocaleString());
	console.log('acc.work', acc.work, acc.work?.toLocaleString());
	// Увлажнитель еще не запускался, нет времени запуска
	if (!acc.work && !acc.stop) {
		console.log(
			'Увлажнитель (Время): Увлажнитель еще не запускался. Начинаем с ожидания'
		);
		ctrlWet(false, 'Увлажнитель еще не запускался. Ожидаем');
		return;
	}

	// Запущен, но время работы увлажнителя истекло
	if (status && acc.work && compareTime(acc.work, wetting.work)) {
		console.log(
			'Увлажнитель (Время): Время работы увлажнителя истекло. Выключаем',
			new Date().toLocaleString()
		);
		ctrlWet(false, 'Время работы истекло');
		return;
	}
	// Выключен, но время простоя увлажнителя истекло
	if (!status && compareTime(acc.stop, wetting.stop)) {
		console.log(
			'Увлажнитель (Время): Время простоя увлажнителя истекло. Запускаем',
			new Date().toLocaleString()
		);
		ctrlWet(true, 'Время ожидания истекло.');
		return;
	}
	console.log(
		'Увлажнитель (Время): Время работы или простоя увлажнителя не истекло. Ничего не делаем. Время работы:' +
			acc.work?.toLocaleString() +
			' Время простоя: ' +
			acc.stop?.toLocaleString()
	);
}

module.exports = time;
