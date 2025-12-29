// Автоматический режим по датчику
function sensor(obj, ctrlWet) {
	const { status, hin, run, wetting } = obj;
	console.log('Увлажнитель (Датчик): ', hin);
	// проверить состояние напорных вентиляторов
	const error = [];
	if (!run) error.push('Напорные вентиляторы не работают.');
	if (!hin) error.push('Датчик влажности отключен.');
	if (error.length > 0) {
		console.log(
			`Увлажнитель (Датчик): Запуск увлажнителя не возможен. ${error.join(
				' '
			)}`
		);
		ctrlWet(false, `По причине: ${error.join(' ')}`);
		return;
	}
	// проверить значение датчика влажности
	if (hin >= wetting.sp && status) {
		console.log(
			'Увлажнитель (Датчик): Влажность продукта выше заданной. Выключаем увлажнитель'
		);
		ctrlWet(
			false,
			`Влажность продукта выше ${wetting.sp}% (-${wetting.hysteresis}%)`
		);
		return;
	}
	if (hin <= wetting.sp - wetting.hysteresis && !status) {
		console.log(
			'Увлажнитель (Датчик): Влажность продукта ниже заданной. Запускаем увлажнитель'
		);
		ctrlWet(
			true,
			`Влажность продукта ниже ${wetting.sp}% (-${wetting.hysteresis}%)`
		);
		return;
	}

	if (!status)
		ctrlWet(
			false,
			`Влажность продукта выше ${wetting.sp}% (-${wetting.hysteresis}%)`
		);
	console.log(
		`Увлажнитель (Датчик): Влажность продукта в пределах заданной. Ничего не делаем. Влажность: ${hin.value}, Заданная влажность: ${wetting.sp}, Гистерезис: ${wetting.hysteresis}`
	);
	return;
}

module.exports = sensor;
