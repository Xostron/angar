const { mAutoByTime, mAutoByDura, mOn } = require('./fn')
const { delUnused } = require('@tool/command/extra')
const { isExtralrm } = require('@tool/message/extralrm')
const { delExtra, wrExtra } = require('@tool/message/extra')
const { msg } = require('@tool/message')
const { isReset } = require('@tool/reset')
const { isAchieve } = require('@tool/message/achieve')
const { isAlr } = require('@tool/message/auto')
const { readAcc } = require('@store/index')

// Вентиляторы секции
function vent(bld, sect, obj, s, se, m, alarm, acc, data, ban, resultFan) {
	const { retain, factory, value } = obj
	const { fanS, vlvS } = m
	const { fanOff, alwaysFan } = data
	// console.log(1116, data)
	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)

	// Очистка аккумулятора и однократное выключение ВНО (acc.firstCycle - флаг для однократной отработки)
	if (!isAccess(bld, sect, obj, fanS, s, ban)) {
		if (s.vent.mode === 'on') {
			if (!acc?.firstCycle) resultFan.start = [false]
			resultFan.force = false
		}
		if (acc?.byDura?.end) resultFan.start = [false]
		acc.firstCycle = true
		clear(bld, sect, acc, 1, 1, 1, 1)
		// return console.log(
		// 	1111,
		// 	'vent',
		// 	'Секция',
		// 	sect.name,
		// 	'isPermission = true: Дополнительная вентиляция неактивна'
		// )
	}

	// Режим вентиляции: Вкл
	if (s.vent.mode === 'on' || alwaysFan) {
		mOn(s, sect._id, resultFan)
		wrExtra(bld._id, sect._id, 'vent_on', msg(bld, sect, 85))
		clear(bld, sect, acc, 0, 1, 1, 1)
		return
	}

	// Режим вентиляции: Авто
	if (s.vent.mode === 'auto') {
		delExtra(bld._id, sect._id, 'vent_on')
		// Подхват
		mAutoByDura(s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan)
		// Рециркуляция
		if (isAccessTime(bld, obj)) {
			mAutoByTime(s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan)
			console.log(1115, 'vent byTime в работе', acc)
		} else {
			acc.byTime = {}
			delExtra(bld._id, sect._id, 'vent_time_wait')
			delExtra(bld._id, sect._id, 'vent_time')
			console.log(1115, 'vent byTime заблокирован', acc)
		}
	}

	// Когда оба отработали и пропала авария- очищаем расчеты
	if (acc.byDura?.finish) {
		// console.log(1116, 'vent byDura выполнился', acc, 'далее byDura очистится')
		acc.byDura = {}
		delExtra(bld._id, sect._id, 'vent_dura')
	}
}
module.exports = vent

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
function isAccess(bld, sect, obj, fanS, s, ban) {
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	// Отключение
	if (!fanS.length) return false
	// Режим вентиляции: Выкл
	if (!s?.vent?.mode || s?.vent?.mode === 'off') return false
	// Таймер запрета, аварийное закрытие клапанов, переключатель на щите (управление от щита)
	if (
		ban ||
		isExtralrm(bld._id, sect._id, 'alrClosed') ||
		isExtralrm(bld._id, sect._id, 'local') ||
		extraCO2.start
	)
		return false

	return true
}

function isAccessTime(bld, obj) {
	const am = obj.retain?.[bld._id]?.automode
	const finish = isAchieve(bld._id, am, 'finish')
	const alrAuto = isAlr(bld._id, am)
	const openVin = isExtralrm(bld._id, null, 'openVin')
	if (!finish && !alrAuto && !openVin) return false
	return true
}

function clear(bld, sect, acc, ...args) {
	acc.byDura = {}
	acc.byTime = {}
	args[0] ? delExtra(bld._id, sect._id, 'vent_on') : null
	args[1] ? delExtra(bld._id, sect._id, 'vent_dura') : null
	args[2] ? delExtra(bld._id, sect._id, 'vent_time_wait') : null
	args[3] ? delExtra(bld._id, sect._id, 'vent_time') : null
}
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
