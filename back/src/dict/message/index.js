const data = {
	0: { code: '', msg: '' },
	// ======== Сушка (Авто)========
	1: {
		code: 'tout1',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы не подходит при сушке',
		count: false, // Участие в счетчике аварий и экран мониторинга
	},
	2: {
		code: 'tout2',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы ниже допустимой при сушке',
	},
	3: {
		code: 'hout1',
		type: 'hout',
		typeSignal: 'sensor',
		msg: 'Влажность улицы ниже допустимой при сушке',
	},
	4: {
		code: 'hout2',
		type: 'hout',
		typeSignal: 'sensor',
		msg: 'Влажность улицы выше допустимой при сушке',
	},
	5: {
		code: 'ahout1',
		type: 'ahout',
		typeSignal: 'sensor',
		msg: 'Абсолютная влажность улицы ниже допустимой при сушке',
	},
	6: {
		code: 'ahout2',
		type: 'ahout',
		typeSignal: 'sensor',
		msg: 'Абсолютная влажность улицы выше допустимой при сушке',
	},
	// ======== Охаждение (Авто) ========
	7: {
		code: 'ahout1',
		type: 'ahout',
		typeSignal: 'sensor',
		msg: 'Абсолютная влажность улицы ниже допустимой при охлаждении',
	},
	8: {
		code: 'ahout2',
		type: 'ahout',
		typeSignal: 'sensor',
		msg: 'Абсолютная влажность улицы выше допустимой при охлаждении',
	},
	9: {
		code: 'hout1',
		type: 'hout',
		typeSignal: 'sensor',
		msg: 'Влажность улицы ниже допустимой при охлаждении',
	},
	10: {
		code: 'hout2',
		type: 'hout',
		typeSignal: 'sensor',
		msg: 'Влажность улицы выше допустимой при охлаждении',
	},
	11: {
		code: 'tout1',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы выше допустимой при охлаждения',
	},
	12: {
		code: 'tout2',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы ниже допустимой при охлаждения',
	},
	16: {
		code: 'tout3',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы ниже допустимой при охлаждения (по продукту)',
	},
	15: { order: 1, code: 'cooling-1', msg: 'Продукт достиг температуры задания' },
	150: { order: 2, code: 'cooling-2', msg: 'Задание канала, задание продукта' },

	// ======== extralrm - доп. аварии склада/секции ========
	// Антивьюга antibliz
	13: { code: 'antibliz', type: 'antibliz', typeSignal: 'valve', msg: 'Сработал режим антивьюги' },
	// Работа клапанов over_vlv
	14: { code: 'over_vlv', typeSignal: 'valve', msg: 'Превышено время работы с закрытыми клапанами' },
	// Авария низкой температуры (Аварийное закрытие клапанов) Реле безопасности
	26: { count: true, code: 'alrClosed', type: 'alr', typeSignal: 'critical', msg: 'Аварийное закрытие клапанов' },
	// Переключатель на щите секции - местный режим
	27: {
		count: true,
		code: 'local',
		type: '',
		typeSignal: 'critical',
		msg: 'Управление переведено переключателем на щите',
	},
	// Модуль не в сети
	28: {
		code: 'connect',
		type: '',
		typeSignal: 'critical',
		msg: 'Обратитесь в сервисный центр (пропала связь с модулем)',
	},
	// Генератор (склад)
	29: {
		count: true,
		code: 'gen',
		type: '',
		typeSignal: 'critical',
		msg: 'Нет электропитания: работа от генератора',
	},
	// Аварии клапанов
	30: { count: true, code: 'alrValve', typeSignal: 'valve', msg: 'Превышено время открытия' },
	31: { count: true, code: 'alrValve', typeSignal: 'valve', msg: 'Превышено время закрытия' },
	32: { count: true, code: 'alrValve', typeSignal: 'valve', msg: 'Оба концевика сработало' },
	33: { count: true, code: 'vlvLim', typeSignal: 'valve', msg: 'Нет питания концевиков' },
	34: { count: true, code: 'vlvCrash', typeSignal: 'valve', msg: 'Авария двигателя' },
	// Аварии вентиляторов
	35: { count: true, code: 'fanCrash', typeSignal: 'fan', msg: 'Авария двигателя' },
	// Нажат аварийный стоп
	36: {
		count: true,
		code: 'alarm',
		type: '',
		typeSignal: 'critical',
		msg: 'Нажат аварийный стоп',
	},
	// Питание отключено
	38: {
		count: true,
		code: 'supply',
		type: '',
		typeSignal: 'critical',
		msg: 'Питание отключено',
	},
	// beep alarm
	65: [{ count: true, code: 'off', typeSignal: 'critical', msg: 'Выбит автоматический выключатель' }],
	// ======== Компрессоры агрегата ========
	// beep alarm
	66: [
		{ count: true, code: 'low', typeSignal: 'critical', msg: 'Низкий уровень масла в компрессоре' },
		{ count: true, code: 'off', typeSignal: 'critical', msg: 'Отключен автомат питания' },
		{ count: true, code: 'stator', typeSignal: 'critical', msg: 'Перегрев обмотки двигателя' },
	],
	// ======== Неисправность датчика ========
	93: { count: true, code: 'sensor', typeSignal: 'sensor', msg: 'Датчики температуры потолка выключены' },
	94: { count: true, code: 'sensor', typeSignal: 'sensor', msg: 'Датчики температуры потолка неисправны' },
	95: { count: true, code: 'sensor', typeSignal: 'sensor', msg: 'Датчики влажности улицы выключены' },
	96: { count: true, code: 'sensor', typeSignal: 'sensor', msg: 'Датчики влажности улицы неисправны' },
	97: { count: true, code: 'sensor', typeSignal: 'sensor', msg: 'Датчики температуры улицы выключены' },
	98: { count: true, code: 'sensor', typeSignal: 'sensor', msg: 'Датчики температуры улицы неисправны' },
	99: { code: 'sensor', typeSignal: 'sensor', msg: 'Автообнаружение неисправности датчика' },
	100: { code: 'sensor', typeSignal: 'sensor', msg: 'Неисправность датчика' },
	// ======== Неисправность модуля ========
	110: { count: true, code: 'module', typeSignal: 'critical', msg: 'Нет связи' },
	111: { count: true, code: 'module', typeSignal: 'critical', msg: 'ПЛК Delta. Нет связи с модулем' },
	// ======== Сообщения extra - доп. функции ========
	// Модуль в сети
	50: { code: '', typeSignal: 'info', msg: 'Модуль в сети' },
	// Разгонный вентилятор
	51: { code: 'off', typeSignal: 'info', msg: 'Режим работы разгонного вентилятора: Выключен' },
	52: { code: 'on', typeSignal: 'info', msg: 'Режим работы разгонного вентилятора: Включен' },
	53: { code: 'time', typeSignal: 'info', msg: 'Режим работы разгонного вентилятора: По времени' },
	54: { code: 'temp', typeSignal: 'info', msg: 'Режим работы разгонного вентилятора: По температуре' },
	// Разгонный вентилятор холодильника
	83: { code: 'auto', typeSignal: 'info', msg: 'Режим работы разгонного вентилятора: Авто' },
	// Подогрев клапанов
	55: { code: 'heating', typeSignal: 'info', msg: 'Подогрев клапанов включен' },
	// Вентиляция
	56: { code: 'off', typeSignal: 'info', msg: 'Режим работы вентиляции: Выключен' },
	57: { code: 'on', typeSignal: 'info', msg: 'Режим работы вентиляции: Включен' },
	58: { code: 'auto', typeSignal: 'info', msg: 'Режим работы вентиляции: Авто' },
	// Прогрев секции
	59: { code: 'warming', typeSignal: 'info', msg: 'Включен прогрев клапанов' },
	//
	60: { code: 'cable', typeSignal: 'info', msg: 'Перегрев вводного кабеля' },
	// ======== Удаление СО2 ========
	61: { code: 'off', typeSignal: 'info', msg: 'CO2: Режим "Выключен"' },
	62: { code: 'on', typeSignal: 'info', msg: 'CO2: Режим "Включен"' },
	63: { code: 'time', typeSignal: 'info', msg: 'CO2: Режим "По времени"' },
	64: { code: 'sens', typeSignal: 'info', msg: 'CO2: Режим "По температуре"' },

	// ======== Оттайка слива воды ========
	67: { code: 'off', typeSignal: 'info', msg: 'Оттайка слива воды: Режим "Выключен"' },
	68: { code: 'on', typeSignal: 'info', msg: 'Оттайка слива воды: Режим "Включен"' },
	69: { code: 'auto', typeSignal: 'info', msg: 'Оттайка слива воды: Режим "Авто"' },
	70: { code: 'temp', typeSignal: 'info', msg: 'Оттайка слива воды: Режим "По температуре!"' },
	71: { code: 'temp', typeSignal: 'info', msg: 'Оттайка слива воды: Включена' },
	72: { code: 'temp', typeSignal: 'info', msg: 'Оттайка слива воды: Отключена' },

	// ======== Склад-холодильник ========
	80: { order: 1, code: 'target', msg: 'Продукт достиг температуры задания ' },
	81: { order: 2, code: 'status', msg: '' },
	// ======== Окуривание (холодильник) ========
	82: {
		code: 'smoking',
		type: '',
		typeSignal: 'critical',
		msg: 'Окуривание',
	},

	// ======== 399 ========
	399: { code: 399, typeSignal: 'info', msg: 'Описание аварии не найдено' },

	// ======== События системы (POS) =======
	400: { msg: 'Система запущена' },

	// ======== Действия пользователя =======
	500: { msg: 'Склад включен' },
	500: { msg: 'Склад выключен' },
	500: { msg: 'Режим склада изменен' },
	500: { msg: 'Продукт изменен' },
	500: { msg: 'Датчик выведен из работы' },
	500: { msg: 'Датчик введен в работу' },
	500: { msg: 'Датчик скоррект' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
	500: { msg: '' },
}

module.exports = data

// Типы сигналов (иконки)
const typeSignal = ['sensor', 'valve', 'critical', 'info', 'timer', 'fan', 'weather']
