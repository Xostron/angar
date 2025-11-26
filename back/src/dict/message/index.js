const data = {
	0: { code: '', msg: '' },
	// ======== Аварии авторежима (Сушка)========
	1: {
		code: 'tout1',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы не подходит при сушке',
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
	// ======== Аварии авторежима (Хранение) ========
	7: {
		code: 'ahout1',
		type: 'ahout',
		typeSignal: 'sensor',
		msg: 'Абсолютная влажность улицы ниже допустимой',
	},
	8: {
		code: 'ahout2',
		type: 'ahout',
		typeSignal: 'sensor',
		msg: 'Абсолютная влажность улицы выше допустимой',
	},
	9: {
		code: 'hout1',
		type: 'hout',
		typeSignal: 'sensor',
		msg: 'Влажность улицы ниже допустимой',
	},
	10: {
		code: 'hout2',
		type: 'hout',
		typeSignal: 'sensor',
		msg: 'Влажность улицы выше допустимой',
	},
	11: {
		code: 'tout1',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы выше допустимой',
	},
	12: {
		code: 'tout2',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы ниже допустимой',
	},
	16: {
		code: 'tout3',
		type: 'tout',
		typeSignal: 'sensor',
		msg: 'Температура улицы ниже допустимой (по продукту)',
	},
	// ======= Сообщения Achieve =======
	15: { order: 1, code: 'finish', msg: 't продукта в задании' },
	150: { order: 2, code: 'target', msg: 'Задание канала, задание продукта' },
	151: { order: 3, code: 'datestop', msg: 'Склад выключен' },

	// ======== extralrm - доп. аварии склада/секции ========
	// Антивьюга antibliz
	13: {
		code: 'antibliz',
		type: 'antibliz',
		typeSignal: 'valve',
		msg: 'Сработал режим антивьюги',
	},
	// Работа клапанов over_vlv
	14: {
		code: 'overVlv',
		typeSignal: 'valve',
		msg: 'Превышено время работы с закрытыми клапанами',
	},
	// Авария низкой температуры (Аварийное закрытие клапанов) Реле безопасности
	26: {
		count: true,
		code: 'alrClosed',
		type: 'alr',
		typeSignal: 'critical',
		msg: 'Аварийное закрытие клапанов',
	},
	// Переключатель на щите секции - местный режим
	27: {
		count: true,
		code: 'local',
		typeSignal: 'critical',
		msg: 'Управление переведено переключателем на щите',
	},
	// Модуль не в сети
	28: {
		code: 'connect',
		typeSignal: 'critical',
		msg: 'Обратитесь в сервисный центр (пропала связь с модулем)',
	},
	// Генератор (склад)
	29: {
		count: true, //Участвует в подсчете аварий (см. карточку склада)
		code: 'gen',
		typeSignal: 'critical',
		msg: 'Работа от генератора',
	},
	// Аварии клапанов
	30: { count: true, code: 'alrValve', typeSignal: 'valve', msg: 'Превышено время открытия' },
	31: { count: true, code: 'alrValve', typeSignal: 'valve', msg: 'Превышено время закрытия' },
	32: { count: true, code: 'alrValve', typeSignal: 'valve', msg: 'Оба концевика сработало' },
	33: { count: true, code: 'vlvLim', typeSignal: 'valve', msg: 'Нет питания концевиков' },
	34: { count: true, code: 'vlvCrash', typeSignal: 'valve', msg: 'Авария двигателя' },
	// Аварии вентиляторов
	35: { count: true, code: 'fanCrash', typeSignal: 'fan', msg: 'Авария вентилятора' },
	// Нажат аварийный стоп
	36: {
		count: true,
		code: 'alarm',
		typeSignal: 'critical',
		msg: 'Нажат аварийный стоп',
	},
	// Питание отключено
	38: {
		count: true,
		code: 'supply',
		typeSignal: 'critical',
		msg: 'Питание отключено',
	},
	// Приточный клапан открыт, темп канала > темп продукта
	39: {
		count: false,
		code: 'openVin',
		typeSignal: 'info',
		msg: 'Температура канала выше температуры продукта',
	},
	40: {
		code: 'stableVno',
		typeSignal: 'fan',
		msg: 'Неправильные настройки "Гистерезиса давления" в "Настройках вентилятора"',
	},

	41: {
		code: 't_channel',
		typeSignal: 'info',
		msg: 'Температура канала ниже рекомендованной',
	},
	// beep alarm
	65: [
		{
			count: true,
			code: 'off',
			typeSignal: 'critical',
			msg: 'Выбит автоматический выключатель',
		},
	],
	// ======== Компрессоры агрегата ========
	// beep alarm
	66: [
		{
			count: true,
			code: 'low',
			typeSignal: 'critical',
			msg: 'Низкий уровень масла в компрессоре',
		},
		{ count: true, code: 'off', typeSignal: 'critical', msg: 'Отключен автомат питания' },
		{ count: true, code: 'stator', typeSignal: 'critical', msg: 'Перегрев обмотки двигателя' },
	],
	// Склад не работает: требуется калибровка клапанов
	90: {
		count: true,
		code: 'notTune',
		type: 'alr',
		typeSignal: 'critical',
		msg: 'Требуется калибровка клапанов',
	},
	// ======== Неисправность датчика ========
	93: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики температуры потолка выключены',
	},
	94: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики температуры потолка неисправны',
	},
	95: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики влажности улицы выключены',
	},
	96: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики влажности улицы неисправны',
	},
	97: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики температуры улицы выключены',
	},
	98: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики температуры улицы неисправны',
	},
	99: { code: 'sensor', typeSignal: 'sensor', msg: 'Автообнаружение неисправности датчика' },
	100: { code: 'sensor', typeSignal: 'sensor', msg: 'Неисправность датчика' },
	102: { count: true, code: 'debdo', typeSignal: 'critical', msg: 'Частое включение' },
	103: {
		count: true,
		code: 'battery',
		typeSignal: 'critical',
		msg: 'Авария питания (Ручной сброс)',
	},
	// ======== Неисправность модуля ========
	110: { count: true, code: 'module', typeSignal: 'critical', msg: 'Нет связи' },
	111: {
		count: true,
		code: 'module',
		typeSignal: 'critical',
		msg: 'ПЛК Delta. Нет связи с модулем',
	},
	// ======== Сообщения extra - доп. функции ========
	50: { code: '', typeSignal: 'info', msg: 'Модуль в сети' },
	101: { code: 'connect_lost', typeSignal: 'info', msg: 'Потеря связи с автоматикой' },
	// Разгонный вентилятор
	51: { code: 'off', typeSignal: 'info', msg: 'Режим работы разгонного вентилятора: Выключен' },
	52: { code: 'on', typeSignal: 'info', msg: 'Режим работы разгонного вентилятора: Включен' },
	53: {
		code: 'time',
		typeSignal: 'info',
		msg: 'Режим работы разгонного вентилятора: По времени',
	},
	54: {
		code: 'temp',
		typeSignal: 'info',
		msg: 'Режим работы разгонного вентилятора: По температуре',
	},
	// Разгонный вентилятор холодильника
	83: { code: 'auto', typeSignal: 'info', msg: 'Режим работы разгонного вентилятора: Авто' },
	// Подогрев клапанов
	55: { code: 'heating', typeSignal: 'info', msg: 'Подогрев клапанов включен' },
	// Вентиляция
	56: { code: 'off', typeSignal: 'info', msg: 'Режим работы вентиляции: Выключен' },
	57: { code: 'on', typeSignal: 'info', msg: 'Режим работы вентиляции: Включен' },
	58: { code: 'auto', typeSignal: 'info', msg: 'Режим работы вентиляции: Авто' },
	85: { code: 'vent_on', typeSignal: 'info', msg: 'Работает внутр. вентиляция (постоянно)' },
	86: { code: 'vent_dura', typeSignal: 'info', msg: 'Работает внутр. вентиляция (подхват)' },
	87: { code: 'vent_time_wait', typeSignal: 'info', msg: 'Работает внутр. вентиляция (ожидание' },
	88: { code: 'vent_time', typeSignal: 'info', msg: 'Работает внутр. вентиляция (по таймеру' },
	141: { code: 'ventCCwait', typeSignal: 'info', msg: 'Внутренняя вентиляция. Ожидание' },
	142: { code: 'ventCCwork', typeSignal: 'info', msg: 'Внутренняя вентиляция. В работе' },
	143: {
		code: 'ventCheck',
		typeSignal: 'info',
		msg: 'Внутренняя вентиляция. Выключена. По причине:',
	},
	// Увлажнение
	130: { code: 'off', typeSignal: 'info', msg: 'Увлажнитель. Режим работы : Выключен.' },
	131: { code: 'on', typeSignal: 'info', msg: 'Увлажнитель. Режим работы: Включен.' },
	132: { code: 'sensor', typeSignal: 'info', msg: 'Увлажнитель. Режим работы: Датчик.' },
	133: { code: 'auto', typeSignal: 'info', msg: 'Увлажнитель. Режим работы: Авто.' },
	134: { code: 'time', typeSignal: 'info', msg: 'Увлажнитель. Режим работы: Время.' },

	135: { code: 'info1', typeSignal: 'info', msg: 'Увлажнитель. Запуск не возможен.' },
	136: { code: 'info2', typeSignal: 'info', msg: 'Увлажнитель запущен.' },
	137: { code: 'info3', typeSignal: 'info', msg: 'Увлажнитель остановлен.' },
	138: { code: 'info4', typeSignal: 'info', msg: 'Увлажнитель. Запуск не возможен.' },
	139: { code: 'info5', typeSignal: 'info', msg: 'Увлажнитель. Запуск не возможен.' },
	140: { code: 'info6', typeSignal: 'info', msg: 'Увлажнитель. Запуск не возможен.' },

	// Прогрев секции
	59: { code: 'warming', typeSignal: 'info', msg: 'Включен прогрев клапанов' },
	//
	60: { code: 'cable', typeSignal: 'info', msg: 'Перегрев вводного кабеля' },
	// ======== Удаление СО2 ========
	61: { code: 'off', typeSignal: 'info', msg: 'CO2: Режим "Выключен"' },
	62: { code: 'on', typeSignal: 'info', msg: 'CO2: Режим "Включен"' },
	63: { code: 'time', typeSignal: 'info', msg: 'CO2: Режим "По времени"' },
	64: { code: 'sens', typeSignal: 'info', msg: 'CO2: Режим "По датчику"' },
	84: { code: 'co2_work', typeSignal: 'info', msg: 'Удаление СО2 в работе' },
	89: { code: 'co2_wait', typeSignal: 'info', msg: 'Удаление СО2 (ожидание' },
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
		typeSignal: 'critical',
		msg: 'Окуривание',
	},

	// ======== 399 ========
	399: { code: 399, typeSignal: 'info', msg: 'Описание аварии не найдено' },

	// ======== События системы (POS) =======
	// 400: { msg: '' },
	// 401: { msg: '' },
	// ======== Действия пользователя =======
	500: { msg: 'Склад включен' },
	501: { msg: 'Склад выключен' },
	502: { msg: 'Режим склада изменен' },
	503: { msg: 'Продукт изменен' },
	504: { msg: 'Датчик выведен из работы' },
	505: { msg: 'Датчик введен в работу' },
	506: { msg: 'Коррекция датчика' },
	507: { msg: 'Сброс аварии' },
	508: { msg: 'Настройки изменены' },
	509: { msg: 'Режим секции изменен' },
	510: paste('Ручное управление: запуск вентилятора *1'),
	511: paste('Ручное управление: стоп вентилятора *1'),
	512: paste('Ручное управление: вентилятор *1 выведен из работы'),
	513: paste('Ручное управление: вентилятор *1 введен в работу'),
	514: { msg: 'Ручное управление: клапан открыть' },
	515: { msg: 'Ручное управление: клапан закрыть' },
	516: { msg: 'Ручное управление: клапан открыть на' },
	517: { msg: 'Ручное управление: клапан стоп' },
	518: paste('*1 *2'),
}

module.exports = data

function paste(msg) {
	return function (...txt) {
		return msg.replace('*1', txt[0]).replace('*2', txt[1])
	}
}
