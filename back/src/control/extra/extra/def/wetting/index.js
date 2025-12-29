/*
Параметры для работы увлажнителя:
- Режим работы(Вкл, Выкл, Авто, Датчик,Время) - выбор режима для выполнения определенного алгоритма
- Относительная влажность продукта (%) для режимов (Авто, Датчик)
- Гистерезис влажности (%) для режимов (Авто, Датчик)
- Время работы увлажнителя (чч:мм) для режимов (Авто, Время)
- Время остановки увлажнителя (чч:мм) для режимов (АвтоВремя)

Условия выхода без выполнения проверок
- Нет увлажнителей
- Секция выключена
- Нет настроек по продукту
- Склад и секция выключены
- Ошибка выполнения режима - нет алгоритма для обработки выставленного режима

Условия остановки
- Выполнение условий режима
- Температура помещения ниже указанного значения TODO добавить гистерезис
- Не работают напорные вентиляторы
- Датчик влажности отключен (только Авто, Датчик)
- Время работы увлажнителя истекло(только Авто, Время)


Режимы:
	Вкл - Принудительное включение увлажнителя (При выполнение обязательных условий)
	Выкл - Принудительное выключение увлажнителя 
	Датчик - запускается если влажность продукта ниже указанной в параметрах (Относительная влажность продукта ) - гистерезис (Гистерезис влажност). Останавливается по достижению указанной влажности
	Время - увлажнитель работает указанное в параметрах врема (Время работы увлажнителя), после останавливается на указанное в параметрах время ( Время остановки увлажнителя)
	Авто - Выполняются условия как в режиме Датчик с добавлением условий режима Время

 */
const { stateEq } = require('@tool/fan');
const { arrCtrlDO } = require('@tool/command/module_output');
const { delExtra, wrExtra } = require('@tool/message/extra');
// const { wrExtralrm, delExtralrm } = require('@tool/message/extralrm');
const { msg } = require('@tool/message');
const beep = require('./check/beep');
const check = require('./check');
const def = require('./def');

const modelist = {
	off: 130,
	on: 131,
	sensor: 132,
	auto: 133,
	time: 134,
};

// Увлажнение секции
function wetting(bld, sect, obj, s, se, m, alarm, acc = {}) {
	const { retain, value, data } = obj;
	const { wettingS } = m;
	// Напорный вентилятор вкл/выкл?
	const fanS = bld?.type === 'cold' ? m.cold.fan : m.fanS;
	// Состояние напорных вентиляторов (true|false)
	const run = fanS.some((f) => stateEq(f._id, value));
	// Состояние склада выкл / ВКЛ
	const bldStatus = retain[bld._id].start;
	// Состояние секции выкл (null||undefined)/ Авто(true) / Ручное (false???)
	const secStatus =
		bld?.type === 'cold' ? true : retain[bld._id]?.mode?.[sect._id];
	// Датчик влажности продукта
	const hin = se.hin;

	const { mode, sp, hysteresis, work, stop } = s.wetting;
	// Нет увлажнителей Выходим
	if(!wettingS.length) return
	// Проверка на аварии Увлажнителей
	const newWettings = beep(wettingS, value, bld, sect);
	if (!newWettings.length) {
			// все увлажнители в аварии
			setMsg(136, 'stop', 'Авария');
			delMsg('run');
			return;
	}
	// Условия выхода без выполнения проверок
	const rCheck = check(
		bld._id,
		sect._id,
		setMsg,
		delMsg,
		wettingS,
		bldStatus,
		secStatus,
		s.wetting,
		def[mode],
		se.tin
	);
	if (rCheck) {
		ctrlWet(false, `По причине: ${rCheck}`);
		return;
	}

	// Текущее Состояние увлажнителя вкл/выкл
	let status = wettingS.some((f) => stateEq(f._id, value));

	// Проверка режима работы увлажнителя
	if (acc?.mode !== mode) {
		// Установка нового режима работы
		acc.mode = mode;
		ctrlWet(false, 'Смена режима работы');
		status = false;
		return;
	}
	// Добавление сообщения о режиме
	setMsg(null, mode);

	// Логика работы увлажнителя по режимам
	const o = {
		acc,
		status,
		bld,
		sect,
		hin,
		run,
		sp,
		hysteresis,
		work,
		stop,
		secStatus,
		bldStatus,
		wetting: s.wetting,
	};

	if (def[mode]) def[mode](o, ctrlWet, setMsg, delMsg);
	else if (status) ctrlWet(false, 'Ошибка выпонлнения режима');

	// Управление ВКЛ/ВЫКЛ Увлажнителей
	function ctrlWet(flag = false, str) {
		if (!newWettings.length) {
			// все увлажнители в аварии
			setMsg(136, 'stop', 'Авария');
			delMsg('run');
			return;
		}
		arrCtrlDO(bld._id, newWettings, flag ? 'on' : 'off');
		if (flag) {
			acc.work = new Date();
			acc.stop = null;
			console.log(`Увлажнитель включен ${acc.work?.toLocaleString()}`);
			delMsg('stop');
			setMsg(135, 'run', str ?? '');
		} else {
			acc.stop = new Date();
			acc.work = null;
			console.log(`Увлажнитель выключен ${acc.stop?.toLocaleString()}`);
			setMsg(136, 'stop', str ?? '');
			delMsg('run');
		}
	}

	// Удаление сообщения
	function delMsg(str) {
		delExtra(bld._id, sect._id, 'wetting', str);
	}

	// Новое сообщение
	function setMsg(key, code, str) {
		wrExtra(
			bld._id,
			sect._id,
			'wetting',
			msg(bld, sect, key || modelist[code], str),
			code
		);

		if (!key)
			Object.keys(modelist).forEach((k) => {
				if (k !== code) delMsg(k);
			});
	}
}

module.exports = wetting;
