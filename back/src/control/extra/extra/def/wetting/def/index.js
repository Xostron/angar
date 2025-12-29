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
	const { run } = obj;
	if (!run) {
		console.log(
			'Увлажнитель (ВКЛ): Запуск увлажнителя не возможен. Напорные вентиляторы не работают.'
		);
		ctrlWet(false, 'Напорные вентиляторы не работают.');
		return;
	}
	// Запускаем
	console.log(
		`Увлажнитель (ВКЛ): Запускаем увлажнение. ${new Date().toLocaleString()}`
	);
	ctrlWet(true);
}

// Увлажнение выключение
function off(obj, ctrlWet) {
	const { status } = obj;
	// Удаляем сообщение о не возможности запуска
	ctrlWet(false);

	if (!status) {
		console.log('Увлажнитель (ВЫКЛ): Увлажнение уже выключено');
		return;
	}
	// Останавливаем
	console.log(
		`Увлажнитель (ВЫКЛ): Останавливаем увлажнение. ${new Date().toLocaleString()}`
	);
}
