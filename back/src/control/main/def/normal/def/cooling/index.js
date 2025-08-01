const alarm = require('./alarm')
const { submode, target, message } = require('./middlew')
const { data: store, readAcc } = require('@store')

// Автоматический режим: Охлаждение
const data = {
	// Аварии режима
	alarm,
	// Логика включения клапанов
	valve,
	// Логика включения вентиляторов
	fan,
	// Данные от охлаждения на Доп. аварии (Антивьюга, работа клапанов и т.д.)
	toAlrS: (s, sectionId, acc) => ({ exclude: '' }),
	// Данные от охлаждения на Доп. функции (контроль вентиляции, обогрев клапанов и т.д.)
	toExtra: (s, alarm, sectionId, acc) => ({ fanOff: alarm, alwaysFan: null }),
	// Промежуточные расчеты по секции
	middlew: (building, section, obj, s, se, seB, alr, acc) => {},
	// Промежуточные расчеты по складу
	middlewB,
}

function middlewB(building, obj, s, seB, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = seB
	// TODO: Как реагировать при обвале датчиков?
	if (tout === null || hout === null) {
		acc.alarm = true
		return
	}
	acc.alarm = false
	// Вычисление подрежима
	submode(building, obj, s, seB, acc)
	// Вычисления
	target(building, obj, s, seB, acc)
	// Сообщения
	message(building, obj, s, seB, acc)
}

function valve(s, se, sectionId, acc, extraCO2) {
	// console.log(4442, 'open', se.tcnl > acc.tcnl + s.cooling.hysteresisIn, se.tcnl, acc.tcnl, s.cooling.hysteresisIn)
	// console.log(4443, 'close', se.tcnl < acc.tcnl - s.cooling.hysteresisIn, se.tcnl, acc.tcnl, s.cooling.hysteresisIn)
	// console.log(4444, 'force', acc.finish, acc.alarm)
	console.log(99003, extraCO2)
	const open = se.tcnl > acc.tcnl + s.cooling.hysteresisIn
	const close = se.tcnl < acc.tcnl - s.cooling.hysteresisIn
	const forceCls = (acc.finish || acc.alarm) && !extraCO2.start
	return { open, close, forceCls, forceOpn: false }
}

function fan(s, se, alr, sectionId, acc, extraCO2) {
	console.log(99002, extraCO2)
	const start = (!alr && !acc.finish && !acc.alarm) || extraCO2.start
	// console.log(777, 'fan ===============',sectionId, start, '=', !alr, !acc.finish, !acc.alarm)
	return { start }
}

module.exports = data
