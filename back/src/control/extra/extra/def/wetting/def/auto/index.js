const { compareTime, remTime } = require('@tool/command/time');

// Автоматический режим по датчику
function auto(obj, ctrlWet, setMsg, delMsg) {
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
		ctrlWet(false, `По причине: ${error.join(' ')}`);
		return;
	}

	// проверить значение датчика влажности
	if (hin >= wetting.sp && status) {
		console.log(
			'Увлажнитель (АВТО): Влажность продукта выше заданной. Выключаем увлажнитель'
		);
		ctrlWet(
			false,
			`Влажность продукта выше ${wetting.sp}% (-${wetting.hysteresis}%)`
		);
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
			ctrlWet(false);
			return;
		}

		if (status && acc.work && compareTime(acc.work, wetting.work)) {
			console.log(
				'Увлажнитель (АВТО): Время работы увлажнителя истекло. Выключаем',
				new Date().toLocaleString()
			);
			ctrlWet(false);
			return;
		}
		if (!status && compareTime(acc.stop, wetting.stop)) {
			console.log(
				'Увлажнитель (АВТО): Время простоя увлажнителя истекло. Запускаем',
				new Date().toLocaleString()
			);
			ctrlWet(true);
			return;
		}
		console.log(
			'Увлажнитель (АВТО): Время работы или простоя увлажнителя не истекло. Ничего не делаем. Время работы:' +
				acc.work?.toLocaleString() +
				' Время простоя: ' +
				acc.stop?.toLocaleString()
		);
		if (acc.work && !compareTime(acc.work, wetting.work)) {
			setMsg(
				135,
				'run',
				`Влажность продукта ниже ${wetting.sp}% (-${
					wetting.hysteresis
				}%).Осталось ${remTime(acc.work, wetting.work)}`
			);
		} else if (acc.stop && !compareTime(acc.stop, wetting.stop)) {
			setMsg(
				136,
				'stop',
				`Влажность продукта ниже ${wetting.sp}% (-${
					wetting.hysteresis
				}%). Осталось ${remTime(acc.stop, wetting.stop)}`
			);
		}
		return;
	}

	if (!status)
		ctrlWet(
			false,
			`Влажность продукта выше ${wetting.sp}% (-${wetting.hysteresis}%)`
		);
	console.log(
		`Увлажнитель (АВТО): Влажность продукта в пределах заданной. Ничего не делаем. Влажность: ${hin.value}, Заданная влажность: ${wetting.sp}, Гистерезис: ${wetting.hysteresis}`
	);
	return;
}

module.exports = auto;
