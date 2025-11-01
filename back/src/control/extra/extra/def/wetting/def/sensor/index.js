const { delExtra, wrExtra } = require('@tool/message/extra');
const { msg } = require('@tool/message');

// Автоматический режим по датчику
function sensor(obj, ctrlWet) {
	const { status, hin, run, bld, sect, wetting } = obj;
	console.log("Увлажнитель (Датчик): ", hin);
	// проверить состояние напорных вентиляторов
	const error = [];
	if (!run) error.push('Напорные вентиляторы не работают.');
	if (!hin) error.push('Датчик влажности отключен.');
	if (error.length > 0) {
		console.log(`Увлажнитель (Датчик): Запуск увлажнителя не возможен. ${error.join(' ')}`);
		wrExtra(
			bld._id,
			sect._id,
			'wetting',
			msg(bld, sect, 135, error.join(' ')),
			'info1'
		);
		if (status) ctrlWet(false);
		return;
		// Удаляем ошибку
	} else delExtra(bld._id, sect._id, 'wetting', 'info1');

	// проверить значение датчика влажности
	if (hin >= wetting.sp) {
		console.log(
			'Увлажнитель (Датчик): Влажность продукта выше заданной. Выключаем увлажнитель'
		);
		if (status) ctrlWet(false, 'Влажность продукта выше заданной');
		return;
	}
	if (hin <= wetting.sp - wetting.hysteresis) {
		console.log(
			'Увлажнитель (Датчик): Влажность продукта ниже заданной. Запускаем увлажнитель'
		);
		if (!status) ctrlWet(true, 'Влажность продукта ниже заданной');
		else console.log('Увлажнитель (Датчик): Увлажнитель уже включен. Ничего не делаем');
		return;
	}

	if (!status)
		ctrlWet(false, 'Значения в допустимых пределах. Ожидание.');
	console.log(
		`Увлажнитель (Датчик): Влажность продукта в пределах заданной. Ничего не делаем. Влажность: ${hin.value}, Заданная влажность: ${wetting.sp}, Гистерезис: ${wetting.hysteresis}`
	);
	return;
}

module.exports = sensor;
