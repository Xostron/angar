const { exit, fnMsg, isAccessTime, clear, fnPrepare, fnSelect } = require('./fn/fn')
const { delExtra, wrExtra } = require('@tool/message/extra')
const def = require('./def')
const { msg } = require('@tool/message')

// Внутренняя вентиляция секции
function vent(bld, sect, obj, s, se, m, alarm, acc, data, ban, resultFan) {
	const { retain, factory, value } = obj
	const { fanS, vlvS } = m
	const { fanOff, alwaysFan } = data
	// Входные данные
	const prepare = fnPrepare(bld, obj, s)
	// Сообщение о выбранном режиме
	fnMsg(bld, acc, s)
	// Выбор алгоритма ВВ
	const code = fnSelect(prepare, acc)
	// Проверка разрешения ВВ и очистка аккумулятора
	exit(bld, sect, code, fanS, s, ban, prepare, acc, resultFan)

	def[code](obj, s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan)

	// // Режим вентиляции: Вкл
	// if (s.vent.mode === 'on' || alwaysFan) {
	// 	mOn(s, sect._id, resultFan)
	// 	wrExtra(bld._id, sect._id, 'vent_on', msg(bld, sect, 85))
	// 	clear(bld, sect, acc, 0, 1, 1, 1)
	// 	return
	// }

	// // Режим вентиляции: Авто
	// if (s.vent.mode === 'auto') {
	// 	delExtra(bld._id, sect._id, 'vent_on')
	// 	// Подхват
	// 	mAutoByDura(obj, s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan)
	// 	// Рециркуляция
	// 	if (isAccessTime(bld, obj)) {
	// 		mAutoByTime(obj, s, m, bld, sect, value, fanS, vlvS, alarm, acc, fanOff, resultFan)
	// 		// console.log(1115, 'vent byTime в работе', acc)
	// 	} else {
	// 		acc.byTime = {}
	// 		delExtra(bld._id, sect._id, 'vent_time_wait')
	// 		delExtra(bld._id, sect._id, 'vent_time')
	// 		// console.log(1115, 'vent byTime заблокирован', acc)
	// 	}
	// }

	// // Когда оба отработали и пропала авария- очищаем расчеты
	// if (acc.byDura?.finish) {
	// 	// console.log(1116, 'vent byDura выполнился', acc, 'далее byDura очистится')
	// 	acc.byDura = {}
	// 	delExtra(bld._id, sect._id, 'vent_dura')
	// }
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
