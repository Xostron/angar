const { delExtra, wrExtra } = require('@tool/message/extra');
const { msg } = require('@tool/message');
const auto = require('./auto');
const time = require('./time');
const sensor = require('./sensor');

const def = {
	on,
	off,
	sensor,
	auto,
	time,
};
module.exports = def;

// Увлажднение включение
function on(obj, ctrlWet) {
	const { status, run, bld, sect } = obj;
	if (!run) {
		console.log(
			'Увлажнитель (ВКЛ): Запуск увлажнителя не возможен. Напорные вентиляторы не работают.'
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
	} else {
		delExtra(bld._id, sect._id, 'wetting', 'info1');
		delExtra(bld._id, sect._id, 'wetting', 'info3');
	}
	// Запускаем
	console.log(`Увлажнитель (ВКЛ): Запускаем увлажнение. ${new Date().toLocaleString()}`);
	if (!status) ctrlWet(true);
}

// Увлажнение выключение
function off(obj, ctrlWet) {
	const { status, bld, sect } = obj;
	// Удаляем сообщение о не возможности запуска
	delExtra(bld._id, sect._id, 'wetting', 'info1');
	if (!status) {
		console.log('Увлажнитель (ВЫКЛ): Увлажнение уже выключено');
		return;
	}
	// Останавливаем
	console.log(
		`Увлажнитель (ВЫКЛ): Останавливаем увлажнение. ${new Date().toLocaleString()}`
	);
	ctrlWet(false);
}
