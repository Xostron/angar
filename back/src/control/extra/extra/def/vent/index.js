const { mAutoByTime, mAutoByDura, mOn } = require('./fn')
const { delUnused } = require('@tool/command/extra')
const { isExtralrm } = require('@tool/message/extralrm')
const { isReset } = require('@tool/reset')
// Вентиляторы секции
function vent(building, section, obj, s, se, m, alarm, acc, data, ban, resultFan) {
	const { retain, factory, value } = obj
	const { fanS, vlvS } = m
	const { fanOff, alwaysFan } = data
	// Сообщение о выбранном режиме
	fnMsg(building, acc, s)
	// Отключение
	if (!fanS.length) return
	// Режим вентиляции: Выкл
	if (!s?.vent?.mode || s?.vent?.mode === 'off') return

	// Таймер запрета (Отключение вентиляторов однократно при работе вентиляции, далее запрет логики вентиляции)
	if (ban || isExtralrm(building._id, section._id, 'alrClosed') || isExtralrm(building._id, section._id, 'local')) {
		if (s.vent.mode === 'on') {
			if (!acc?.firstCycle) resultFan.start = [false]
		}
		if (acc?.byDura?.end) resultFan.start = [false]
		acc.byDura = {}
		acc.byTime = {}
		acc.firstCycle = true
		return
	}

	// Режим вентиляции: Вкл
	if (s.vent.mode === 'on' || alwaysFan) {
		mOn(s, section._id)
		return
	}
	// Режим вентиляции: Авто
	if (s.vent.mode === 'auto') {
		mAutoByDura(s, m, building, section, value, fanS, vlvS, alarm, acc, fanOff, resultFan)
		mAutoByTime(s, m, building, section, value, fanS, vlvS, alarm, acc, fanOff, resultFan)
	}

	// Когда оба отработали и пропала авария- очищаем расчеты
	if ((acc.byTime?.finish && alarm.byDura?.finish && !alarm) || (!alarm && isReset(building._id))) {
		acc.byDura = {}
		acc.byTime = {}
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

function fnMsg(building, acc, s) {
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
		delUnused(arr, s?.vent?.mode, building, code, 'vent')
	}
}
