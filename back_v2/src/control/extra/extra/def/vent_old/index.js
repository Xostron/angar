const { mAutoByTime, mAutoByDura, mOn } = require('./fn')
const { delUnused } = require('@tool/command/extra')
const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { msg } = require('@tool/message')
const { isReset } = require('@tool/reset')

// Вентиляторы секции
function vent(bld, sect, obj, s, se, m, alarm, acc, data, ban, resultFan) {
	const { retain, factory, value } = obj
	const { fanS, vlvS } = m
	const { fanOff, alwaysFan } = data
	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)

	// Очистка аккумулятора и однократное выключение ВНО (acc.firstCycle - флаг для однократной отработки)
	if (!isPermission(bld, sect, fanS, s, ban)) {
		if (s.vent.mode === 'on') {
			if (!acc?.firstCycle) resultFan.start = [false]
			resultFan.force = false
		}
		if (acc?.byDura?.end) resultFan.start = [false]
		acc.byDura = {}
		acc.byTime = {}
		acc.firstCycle = true
		console.log(
			1114,
			'Секция',
			sect.name,
			'isPermission = true: Дополнительная вентиляция неактивна'
		)
		delExtra(bld._id, sect._id, 'vent_on')
		delExtra(bld._id, sect._id, 'vent_dura')
		delExtra(bld._id, sect._id, 'vent_time_wait')
		delExtra(bld._id, sect._id, 'vent_time')
		return
	}

	// Режим вентиляции: Вкл
	if (s.vent.mode === 'on' || alwaysFan) {
		mOn(s, sect._id, resultFan)
		wrExtra(bld._id, sect._id, 'vent_on', msg(bld, sect, 85))
		delExtra(bld._id, sect._id, 'vent_dura')
		delExtra(bld._id, sect._id, 'vent_time_wait')
		delExtra(bld._id, sect._id, 'vent_time')
		return
	}

	// Режим вентиляции: Авто
	if (s.vent.mode === 'auto') {
		mAutoByDura(s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan)
		mAutoByTime(s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan)
		delExtra(bld._id, sect._id, 'vent_on')
	}
	console.log(1117, 'Доп. Вентиляция (extra vent)', acc.byTime?.finish && alarm.byDura?.finish, acc)
	// Когда оба отработали и пропала авария- очищаем расчеты
	// if ((acc.byTime?.finish && alarm.byDura?.finish && !alarm) || (!alarm && isReset(bld._id))) {
	if ((acc.byTime?.finish && acc.byDura?.finish) || (!alarm && isReset(bld._id))) {
		acc.byDura = {}
		acc.byTime = {}
		console.log(1118, 'clear vent', acc)
		delExtra(bld._id, sect._id, 'vent_on')
		delExtra(bld._id, sect._id, 'vent_dura')
		delExtra(bld._id, sect._id, 'vent_time_wait')
		delExtra(bld._id, sect._id, 'vent_time')
	}
}
module.exports = vent

// mode: выкл/вкл, авто, по времени - (приоритет: Сушка - постоянный вентилятор)
// mode - Вкл, секция в любом авто режиме, склад запущен, вентиляторы всегда работают (аварии игнор)
/**
 * По времени:
 *  * реагирует на аварии данного авто режима:
 * Ожидание внутренней вентиляции:
 * 1 - появилась авария выкл вентиляторы (отсчет этого времени), авария ушла раньше - вкл вентиляторы
 * 2 - авария появилась - отсчет времени () - авария все еще остается - вкл вентиляторы на время (работа внутренней вентиляции) -
 * если в этот промежуток времени сбросилась авария, то вентиляторы продолжают работу в штатном режиме
 * (никакого отсчета не происходит)
 *
 * Auto:
 * Дополнительная вентиляция в % = Время бесперывной работы вентилятора * х% = 10мин
 * Максимальная дополнительная вентиляция - 15мин
 * Если пришла авария на останов вентилятора, включается данная функция подхвата работы
 *  вентилятора на дополнительное время вентиляции (Если ранее в течении подсчета времени беспрерывной работы вентиляторов был открыт приточный клапан)
 *
 * Дополнительная вентиляция или максимальная доп вентиляция = 0 - По времени
 * Работа внутренней вентиляции = 0 - авто
 * Ождание внутр вентил и Работа внутр вент = 0 - авто
 * Ожидание внутр вент = 0 , работа внутр вент > 0 - режим Вкл
 */

function fnMsg(bld, acc, s) {
	if (acc.lastMode != s?.vent?.mode) {
		acc.lastMode = s?.vent?.mode
		let code
		switch (s?.vent?.mode) {
			case null:
			case 'off':
				code = 56
				break
			case 'on':
				code = 57
				break
			case 'auto':
				code = 58
				break
			default:
				code = 399
				break
		}
		const arr = [null, 'off', 'on', 'auto']
		delUnused(arr, s?.vent?.mode, bld, code, 'vent')
	}
}

// Разрешить вентиляцию (true)
function isPermission(bld, sect, fanS, s, ban) {
	// Отключение
	if (!fanS.length) return false
	// Режим вентиляции: Выкл
	if (!s?.vent?.mode || s?.vent?.mode === 'off') return false
	// Таймер запрета, аварийное закрытие клапанов, переключатель на щите (управление от щита)
	if (ban || isExtralrm(bld._id, sect._id, 'alrClosed') || isExtralrm(bld._id, sect._id, 'local'))
		return false
	return true
}
