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
	// ======= Сообщения Achieve ======= flt: [true] - включить отправку в push
	15: { order: 1, code: 'finish', msg: 't продукта в задании' },
	150: { order: 2, code: 'target', msg: '' },
	151: { order: 3, code: 'datestop', msg: 'Склад выключен', flt: [true] },
	152: { order: 4, code: 'sectOff', msg: 'Нет секций в авто', flt: [true] },
	153: { order: 2, code: 'drying1', msg: '' },
	154: { order: 2, code: 'drying2', msg: '' },
	155: { order: 2, code: 'drying3', msg: '' },

	// ======== extralrm - доп. аварии склада/секции ========
	// Антивьюга antibliz
	13: {
		count: true,
		code: 'antibliz',
		typeSignal: 'critical',
		msg: 'Сработал режим антивьюги',
		flt: [true],
	},
	// Работа клапанов over_vlv
	14: {
		count: true,
		code: 'overVlv',
		typeSignal: 'critical',
		msg: 'Превышено время работы с закрытыми клапанами',
		flt: [true],
	},
	// Авария низкой температуры (Аварийное закрытие клапанов) Реле безопасности
	26: {
		count: true,
		code: 'alrClosed',
		typeSignal: 'critical',
		msg: 'Аварийное закрытие клапанов',
		flt: [true],
	},
	// Переключатель на щите секции - местный режим
	27: {
		count: true,
		code: 'local',
		typeSignal: 'critical',
		msg: 'Управление переведено переключателем на щите',
		flt: [true],
	},
	// Модуль не в сети
	28: {
		code: 'connect',
		typeSignal: 'critical',
		msg: 'Обратитесь в сервисный центр (пропала связь с модулем)',
		flt: [true],
	},
	// Генератор (склад)
	29: {
		count: true, //Участвует в подсчете аварий (см. карточку склада)
		code: 'gen',
		typeSignal: 'critical',
		msg: 'Работа от генератора',
		flt: [true],
	},
	// Аварии клапанов
	30: {
		count: false,
		code: 'alrValve',
		typeSignal: 'critical',
		msg: 'Превышено время открытия',
		flt: [true],
	},
	31: {
		count: false,
		code: 'alrValve',
		typeSignal: 'critical',
		msg: 'Превышено время закрытия',
		flt: [true],
	},
	32: {
		count: true,
		code: 'alrValve',
		typeSignal: 'critical',
		msg: 'Оба концевика сработало',
		flt: [true],
	},
	33: {
		count: true,
		code: 'vlvLim',
		typeSignal: 'critical',
		msg: 'Нет питания концевиков',
		flt: [true],
	},
	34: {
		count: true,
		code: 'vlvCrash',
		typeSignal: 'critical',
		msg: 'Авария двигателя',
		flt: [true],
	},
	// Аварии вентиляторов
	35: {
		count: true,
		code: 'fanCrash',
		typeSignal: 'critical',
		msg: 'Авария вентилятора',
		flt: [true],
	},
	// Нажат аварийный стоп
	36: {
		count: true,
		code: 'alarm',
		typeSignal: 'critical',
		msg: 'Нажат аварийный стоп',
		flt: [true],
	},
	// Питание отключено DI
	38: {
		count: true,
		code: 'supply',
		typeSignal: 'critical',
		msg: 'Авария питания',
		flt: [true],
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
		typeSignal: 'info',
		msg: 'Неправильные настройки "Гистерезиса давления" в "Настройках вентилятора"',
		flt: [true],
	},

	41: {
		code: 't_channel',
		typeSignal: 'info',
		msg: 'Температура канала ниже рекомендованной',
	},
	// beep alarm
	65: [
		{
			count: false,
			code: 'off',
			typeSignal: 'critical',
			msg: 'Выбит автоматический выключатель',
			flt: [true],
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
			flt: [true],
		},
		{
			count: true,
			code: 'off',
			typeSignal: 'critical',
			msg: 'Отключен автомат питания',
		},
		{
			count: true,
			code: 'stator',
			typeSignal: 'critical',
			msg: 'Перегрев обмотки двигателя',
		},
	],
	// Склад не работает: требуется калибровка клапанов
	90: {
		count: true,
		code: 'notTune',
		typeSignal: 'critical',
		msg: 'Требуется калибровка клапанов',
		flt: [true],
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
		flt: [true],
	},
	96: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики влажности улицы неисправны',
		flt: [true],
	},
	97: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики температуры улицы выключены',
		flt: [true],
	},
	98: {
		count: true,
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Датчики температуры улицы неисправны',
		flt: [true],
	},
	99: {
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Автообнаружение неисправности датчика',
	},
	100: {
		code: 'sensor',
		typeSignal: 'sensor',
		msg: 'Неисправность датчика',
		flt: [true],
	},
	102: {
		count: true,
		code: 'debdo',
		typeSignal: 'critical',
		msg: 'Частое включение',
		flt: [true],
	},
	103: {
		count: true,
		code: 'battery',
		typeSignal: 'critical',
		msg: 'Авария питания (Ручной сброс)',
		flt: [true],
	},
	103: {
		// count: true,
		code: 'heatingClrCrash',
		typeSignal: 'critical',
		msg: 'Оттайка. Отключен автомат питания',
		flt: [true],
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
	101: {
		count: true,
		code: 'connect_lost',
		typeSignal: 'critical',
		msg: 'Потеря связи с автоматикой',
	},
	// Разгонный вентилятор
	51: {
		code: 'off',
		typeSignal: 'info',
		msg: 'Режим работы разгонного вентилятора: Выключен',
	},
	52: {
		code: 'on',
		typeSignal: 'info',
		msg: 'Режим работы разгонного вентилятора: Включен',
	},
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
	83: {
		code: 'auto',
		typeSignal: 'info',
		msg: 'Режим работы разгонного вентилятора: Авто',
	},
	// Подогрев клапанов
	55: {
		code: 'heating',
		typeSignal: 'info',
		msg: 'Подогрев клапанов включен',
	},

	// Увлажнение
	130: {
		code: 'off',
		typeSignal: 'info',
		msg: 'Увлажнитель. Режим работы : Выключен.',
	},
	131: {
		code: 'on',
		typeSignal: 'info',
		msg: 'Увлажнитель. Режим работы: Включен.',
	},
	132: {
		code: 'sensor',
		typeSignal: 'info',
		msg: 'Увлажнитель. Режим работы: Датчик.',
	},
	133: {
		code: 'auto',
		typeSignal: 'info',
		msg: 'Увлажнитель. Режим работы: Авто.',
	},
	134: {
		code: 'time',
		typeSignal: 'info',
		msg: 'Увлажнитель. Режим работы: Время.',
	},

	135: { code: 'run', typeSignal: 'info', msg: 'Увлажнитель запущен.' },
	136: { code: 'stop', typeSignal: 'info', msg: 'Увлажнитель остановлен.' },

	137: {
		code: 'impossible',
		typeSignal: 'info',
		msg: 'Увлажнитель. Запуск невозможен.',
	},
	138: {
		code: 'impossible_tin',
		typeSignal: 'info',
		msg: 'Увлажнитель. Запуск невозможен. Температура помещения ниже',
	},

	139: {
		code: 'impossible_sec',
		typeSignal: 'info',
		msg: 'Увлажнитель. Запуск невозможен. Cекция выключена.',
	},
	140: {
		code: 'impossible_conf',
		typeSignal: 'info',
		msg: 'Увлажнитель. Запуск невозможен. Нет настроек по продукту.',
	},
	141: {
		code: 'impossible_bld_sec',
		typeSignal: 'info',
		msg: 'Увлажнитель. Запуск невозможен. Склад и секция выключены',
	},
	142: {
		code: 'impossible_fun',
		typeSignal: 'info',
		msg: 'Увлажнитель. Запуск невозможен. Напорные вентиляторы не работают',
	},
	160: {
		code: 'impossible',
		typeSignal: 'critical',
		msg: '',
	},
	// Прогрев секции
	59: {
		code: 'warming',
		typeSignal: 'info',
		msg: 'Включен прогрев клапанов',
	},
	//
	60: { code: 'cable', typeSignal: 'critical', msg: 'Перегрев вводного кабеля' },
	// Вентиляция
	87: { code: 'ventWait', typeSignal: 'info', msg: 'Обдув датчиков. Ожидание' },
	88: { code: 'ventWork', typeSignal: 'info', msg: 'Обдув датчиков. Работа' },
	141: { code: 'ventWait', typeSignal: 'info', msg: 'Внутренняя вентиляция. Ожидание' },
	142: { code: 'ventWork', typeSignal: 'info', msg: 'Внутренняя вентиляция. Работа' },
	143: {
		code: 'ventCheck',
		typeSignal: 'info',
		msg: 'Внутренняя вентиляция (Обдув датчиков). Выключена. По причине:',
	},
	144: { code: 'off', typeSignal: 'info', msg: 'Внутренняя вентиляция. Режим выключен' },
	145: { code: 'ventOn', typeSignal: 'info', msg: 'Внутренняя вентиляция. Режим включен' },
	146: { code: 'auto', typeSignal: 'info', msg: 'Внутренняя вентиляция. Режим авто' },
	147: {
		code: 'combiCold',
		typeSignal: 'info',
		msg: 'Внутренняя вентиляция (Обдув датчиков). Режим комби-холодильник',
	},
	148: {
		code: 'durCheck',
		typeSignal: 'info',
		msg: 'Дополнительная вентиляция. Выключена. По причине:',
	},
	149: { code: 'durVentWork', typeSignal: 'info', msg: 'Доп. вентиляция. В работе' },
	// ======== Удаление СО2 ========
	61: { code: 'off', typeSignal: 'info', msg: 'Удаление CO2. Режим выключен' },
	62: { code: 'co2on', typeSignal: 'info', msg: 'Удаление CO2. Режим включен' },
	63: { code: 'time', typeSignal: 'info', msg: 'Удаление CO2. Режим по времени' },
	64: { code: 'sensor', typeSignal: 'info', msg: 'Удаление CO2. Режим по датчику' },
	84: { code: 'co2work', typeSignal: 'info', msg: 'Удаление СО2. Работа' },
	85: { code: 'co2wait', typeSignal: 'info', msg: 'Удаление СО2. Ожидание' },
	86: { code: 'co2check', typeSignal: 'info', msg: 'Удаление СО2. Выключена. По причине:' },
	// 89: { code: 'co2check', typeSignal: 'info', msg: 'Удаление СО2. Выключена. По причине:' },
	// ======== Оттайка слива воды ========
	67: {
		code: 'off',
		typeSignal: 'info',
		msg: 'Оттайка слива воды: Режим "Выключен"',
	},
	68: {
		code: 'on',
		typeSignal: 'info',
		msg: 'Оттайка слива воды: Режим "Включен"',
	},
	69: {
		code: 'auto',
		typeSignal: 'info',
		msg: 'Оттайка слива воды: Режим "Авто"',
	},
	70: {
		code: 'temp',
		typeSignal: 'info',
		msg: 'Оттайка слива воды: Режим "По температуре!"',
	},
	71: {
		code: 'temp',
		typeSignal: 'info',
		msg: 'Оттайка слива воды: Включена',
	},
	72: {
		code: 'temp',
		typeSignal: 'info',
		msg: 'Оттайка слива воды: Отключена',
	},

	// ======== Склад-холодильник ========
	80: { order: 1, code: 'finish', msg: 'Продукт достиг температуры задания ' },
	81: { order: 2, code: 'target', msg: '' },
	// ======== Окуривание (холодильник) ========
	82: {
		code: 'smoking',
		typeSignal: 'info',
		msg: 'Окуривание.',
	},
	// ======== Озонатор (холодильник) ========
	91: {
		code: 'ozon',
		typeSignal: 'info',
		msg: 'Озонатор.',
	},
	// ======== 399 ========
	399: { code: 399, typeSignal: 'info', msg: 'Описание аварии не найдено' },

	// ======== События системы (POS) =======
	// 400: { msg: '' },
	// 401: { msg: '' },
	// ======== Действия пользователя =======
	500: { msg: 'Склад включен' },
	501: { msg: 'Склад выключен' },
	502: { msg: 'Режим склада изменен', flt: [true] },
	503: { msg: 'Продукт изменен', flt: [true] },
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
