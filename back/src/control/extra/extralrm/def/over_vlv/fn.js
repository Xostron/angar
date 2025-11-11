const { msg } = require('@tool/message')
const { delExtralrm, wrExtralrm } = require('@tool/message/extralrm')
const { compareTime } = require('@tool/command/time')
const { isAlr } = require('@tool/message/auto')

function set(bld, sect, obj, m, s, acc, term) {
	// Логика
	// Условия аварии возникли засекаем время s.overVlv.time
	if (term && !acc.time) acc.time = new Date()
	// Время ожидания 5 мин закончилось
	const time = compareTime(acc?.time, s.overVlv.time)
	// Вкл аварии и засекаем время для сброса аварии 1 час
	if (time && !acc._alarm) {
		wrExtralrm(bld._id, sect._id, 'overVlv', msg(bld, sect, 14))
		acc.wait = new Date()
		acc._alarm = true
		acc.flag = true
	}
}

function reset(bld, sect, s, acc, term) {
	// Cброс аварии и аккумулятора:
	// 1. Был сброс аварии
	if (acc.flag && !acc._alarm) return fnReset(bld, sect, acc)
	// 2. Если еще нет аварии, и условия для аварии прошли за время s.overVlv.time
	if (!term && !acc._alarm) return fnReset(bld, sect, acc)
	// 3. Время автосброса аварии закончилось
	const wait = compareTime(acc.wait, s.overVlv.wait)
	if (wait) fnReset(bld, sect, acc)
}

function fnCheck(bld, sect, obj, m, vlvIn, s, automode, acc) {
	// Очищаем аккумулятор и игнорируем слежение:
	// 1. Склад выключен
	// 2. Секция не в авто
	// 3. Нет приточных клапанов
	// 4. Нет настроек
	// 5. Авторежим сушка && Настройки.Сушка.Постоянный вент=true
	// 6. Настройки.Вентиляция.Управление вент=ВКЛ('on')
	// 7. Склад холодильник
	// 8. Склад Комби в режиме холодильника
	const alrAuto = isAlr(bld._id, automode)
	if (
		!obj.retain[bld._id].start ||
		!obj.retain[bld._id].mode?.[sect._id] ||
		!vlvIn ||
		!s.overVlv.time ||
		!s.overVlv.wait ||
		(automode === 'drying' && s.drying.ventilation) ||
		s.vent.mode === 'on' ||
		bld?.type === 'cold' ||
		(bld?.type === 'combi' && automode === 'cooling' && alrAuto)
	) {
		fnReset(bld, sect, acc)
		return false
	}
	return true
}

function fnReset(bld, sect, acc) {
	delExtralrm(bld._id, sect._id, 'overVlv')
	delete acc.time
	delete acc.wait
	delete acc.flag
	delete acc._alarm
}

module.exports = { set, reset, fnReset, fnCheck }
