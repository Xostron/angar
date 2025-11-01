const { delExtra, wrExtra } = require('@tool/message/extra');
const { msg } = require('@tool/message');
const { compareTime } = require('@tool/command/time');

// Автоматический режим по датчику
function auto(obj, ctrlWet) {
	const { status, hin, run, bld, sect, wetting, acc } = obj;
	// проверить состояние напорных вентиляторов
	console.log('Увлажнитель (АВТО): ', hin, acc);
	const error = [];
	if (!run) error.push('Напорные вентиляторы не работают.');
	if (!hin) error.push('Датчик влажности отключен.');
	if (error.length > 0) {
		console.log(
			`Увлажнитель (АВТО): Запуск увлажнителя не возможен. ${error.join(
				' '
			)}`
		);
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
			'Увлажнитель (АВТО): Влажность продукта выше заданной. Выключаем увлажнитель'
		);
		if (status) ctrlWet(false, 'Влажность продукта выше заданной');
		return;
	}
	if (hin < wetting.sp - wetting.hysteresis) {
		console.log(
			'Увлажнитель (АВТО): Влажность продукта ниже заданной. Проверяем вермя'
		);

		if (!acc.work && !acc.stop) {
			console.log(
				'Увлажнитель (АВТО): Увлажнитель еще не запускался. Начинаем с ожидания'
			);
			ctrlWet(false, 'Увлажнитель еще не запускался. Ожидаем');
			return;
		}

		if (status && acc.work && compareTime(acc.work, wetting.work)) {
			console.log(
				'Увлажнитель (АВТО): Время работы увлажнителя истекло. Выключаем',
				new Date().toLocaleString()
			);
			ctrlWet(
				false,
				'Влажность продукта ниже заданной. Время работы истекло.'
			);
			return;
		}
		if (!status && compareTime(acc.stop, wetting.stop)) {
			console.log(
				'Увлажнитель (АВТО): Время простоя увлажнителя истекло. Запускаем',
				new Date().toLocaleString()
			);
			ctrlWet(
				true,
				'Влажность продукта ниже заданной. Время ожидания истекло. '
			);
			return;
		}
		console.log(
			'Увлажнитель (АВТО): Время работы или простоя увлажнителя не истекло. Ничего не делаем. Время работы:' +
				acc.work?.toLocaleString() +
				' Время простоя: ' +
				acc.stop?.toLocaleString()
		);
		return;
	}

	if (!status) ctrlWet(false, 'Значения в допустимых пределах. Ожидание.');
	console.log(
		`Увлажнитель (АВТО): Влажность продукта в пределах заданной. Ничего не делаем. Влажность: ${hin.value}, Заданная влажность: ${wetting.sp}, Гистерезис: ${wetting.hysteresis}`
	);
	return;
}

module.exports = auto;
