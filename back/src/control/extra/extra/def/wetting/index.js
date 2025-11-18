/*
все типы складов
включение /выключение увлажнителя


Режимы работы
Автоматический
Цикличный
Выключен - на постоянной основе до команды пользователя
Включен - на постоянной основе до команды пользователя


Автоматический
условия работы
напорный вентилятор включен (им мы не управляем)
уровень влажности меньше указанного в настройках - гистерезис из настроек
условия отключения
напорный вентилятор выключен (им мы не управляем)
влажность достигла указанного значения

Цикличный режим
условия работы
n минут работы не истекли
напорный вентилятор включен (им мы не управляем)
x минут выключения истекли
Условия отключения
напорный вентилятор выключен (им мы не управляем)
х минут выключения еще не истекли
n минут работы истекли

Автоматический по времени
условия работы
напорный вентилятор включен (им мы не управляем)
уровень влажности меньше указанного в настройках - гистерезис из настроек
n минут работы не истекли
x минут выключения истекли

условия отключения
напорный вентилятор выключен (им мы не управляем)
влажность достигла указанного значения
х минут выключения еще не истекли
n минут работы истекли
 */
const { stateEq } = require('@tool/command/fan/fn')
const { arrCtrlDO } = require('@tool/command/module_output')
const { delExtra, wrExtra, isExtra } = require('@tool/message/extra')
const { msg } = require('@tool/message')
const def = require('./def')

// Увлажнение секции
// TODO Останавливать увлажнитель при температуре помещения +0.5С
function wetting(bld, sect, obj, s, se, m, alarm, acc = {}) {
	const { retain, value } = obj
	const { wettingS } = m
	if (!wettingS?.length) {
		wrExtra(
			bld._id,
			sect._id,
			'wetting',
			msg(bld, sect, 139, `Устройство отсутствует.`),
			'info7'
		)
		msgMode('')
		delExtra(bld._id, sect._id, 'wetting', 'info1')
		delExtra(bld._id, sect._id, 'wetting', 'info2')
		delExtra(bld._id, sect._id, 'wetting', 'info3')
		delExtra(bld._id, sect._id, 'wetting', 'info4')
		delExtra(bld._id, sect._id, 'wetting', 'info5')
		delExtra(bld._id, sect._id, 'wetting', 'info6')
		return
	} else delExtra(bld._id, sect._id, 'wetting', 'info7')
	const fanS = bld?.type === 'cold' ? m.cold.fan : m.fanS
	// Входные данные
	// Температура помещения
	if (se.tin < 0.5) {
		wrExtra(
			bld._id,
			sect._id,
			'wetting',
			msg(bld, sect, 139, `Температура помещения ниже 0.5 °C.`),
			'info8'
		)
		ctrlWet(false, 'Не подходящие условия')
		return
	} else delExtra(bld._id, sect._id, 'wetting', 'info8')

	// Текущее Состояние увлажнителя вкл/выкл
	let status = wettingS.some((f) => stateEq(f._id, value))
	// Состояние склада выкл / ВКЛ
	const bldStatus = retain[bld._id].start
	// Состояние секции выкл (null||undefined)/ Авто(true) / Ручное (false???)

	const secStatus = bld?.type === 'cold' ? true : retain[bld._id]?.mode?.[sect._id]

	if (secStatus === undefined || secStatus === null) {
		console.log(
			'Запуск увлажнителя не возможен. Cекция выключена',
			secStatus
			// retain[bld._id]?.[sect._id],
			// retain[bld._id]
		)
		wrExtra(bld._id, sect._id, 'wetting', msg(bld, sect, 138, `Cекция выключена`), 'info4')
		return ctrlWet(false)
	} else delExtra(bld._id, sect._id, 'wetting', 'info4')
	// Напорный вентилятор вкл/выкл?
	// Состояние напорных вентиляторов (true|false)
	const run = fanS.some((f) => stateEq(f._id, value))

	// Датчик влажности продукта
	const hin = se.hin
	// Датчик влажности улицы  {value: 900, state: alarm||on||off}
	// const hout = se.hout;

	// Настройки
	// Режим (Автоматический(avto), Автоматический с таймером(avtoT), По таймеру(timer), Включен(on), Выключен(off))
	if (!s.wetting) {
		console.log(
			'Запуск увлажнителя не возможен. Нет настроек по продукту',
			secStatus,
			retain[bld._id]?.[sect._id],
			retain[bld._id]
		)
		wrExtra(
			bld._id,
			sect._id,
			'wetting',
			msg(bld, sect, 138, `Нет настроек по продукту`),
			'info6'
		)
		return
	} else delExtra(bld._id, sect._id, 'wetting', 'info6')
	const { mode, sp, hysteresis, work, stop } = s.wetting

	// Проверка режима работы увлажнителя
	if (acc?.mode !== mode) {
		// Установка нового режима работы
		acc.mode = mode
		ctrlWet(false, 'Смена режима работы')
		status = false
		return
	}
	// Добавление сообщения о режиме
	msgMode(mode)
	if ((!bldStatus && secStatus === null) || secStatus === null) {
		console.log('On: Запуск увлажнителя не возможен. Склад и секция выключены')
		wrExtra(
			bld._id,
			sect._id,
			'wetting',
			msg(bld, sect, 135, `Склад и секция выключены`),
			'info5'
		)
		// "Секция {sect.name} Увлажнитель выключен"
		return ctrlWet(false)
	} else delExtra(bld._id, sect._id, 'wetting', 'info5')
	// TODO Логика работы увлажнителя по режимам
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
	}

	if (def[mode]) def[mode](o, ctrlWet)
	else if (status) ctrlWet(false, 'Ошибка выпонлнения режима')

	// Управление
	function ctrlWet(flag = false, str) {
		// false - выключить, true - включить
		arrCtrlDO(wettingS, bld._id, flag ? 'on' : 'off')
		if (flag) {
			acc.work = new Date()
			acc.stop = null
			console.log(`Увлажнитель включен ${acc.work?.toLocaleString()}`)
		} else {
			acc.stop = new Date()
			acc.work = null
			console.log(`Увлажнитель выключен ${acc.stop?.toLocaleString()}`)
		}

		if (flag) {
			delExtra(bld._id, sect._id, 'wetting', 'info3')
			wrExtra(bld._id, sect._id, 'wetting', msg(bld, sect, 136, str ?? ''), 'info2')
		} else {
			delExtra(bld._id, sect._id, 'wetting', 'info2')
			wrExtra(bld._id, sect._id, 'wetting', msg(bld, sect, 137, str ?? ''), 'info3')
		}
	}

	// Сообщения для выбранного режима
	function msgMode(mode) {
		const list = [
			[130, 'off'],
			[131, 'on'],
			[132, 'sensor'],
			[133, 'auto'],
			[134, 'time'],
		]
		// Очищаем от старого
		list.forEach((el) => {
			if (el[1] === mode) wrExtra(bld._id, sect._id, 'wetting', msg(bld, sect, el[0]), el[1])
			else delExtra(bld._id, sect._id, 'wetting', el[1])
		})
	}
}

module.exports = wetting
