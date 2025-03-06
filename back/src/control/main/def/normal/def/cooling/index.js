const alarm = require('./alarm')
const { submode, target, message } = require('./middlew')

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
	// message: (s, se, sectionId, acc) => {},
	middlew,
}

function middlew(building, section, obj, s, se, seB, alr, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = se
	// TODO: Как реагировать при обвале датчиков?
	if (tout === null || hout === null) {
		console.log(7777, ' ============================')
		acc.alarm = true
		return
	}
	acc.alarm = false
	// Вычисление подрежима
	submode(building, section, obj, s, se, seB, alr, acc)
	// Вычисления

	target(building, section, obj, s, se, seB, alr, acc)
	// Сообщения
	message(building, section, obj, s, se, seB, alr, acc)
}

function valve(s, se, sectionId, acc) {
	const open = se.tcnl > acc.tcnl + s.cooling.hysteresisIn
	const close = se.tcnl < acc.tcnl - s.cooling.hysteresisIn
	const forceCls = acc.finish || acc.alarm
	return { open, close, forceCls, forceOpn: false }
}

function fan(s, se, alr, sectionId, acc) {
	const start = !alr && !acc.finish && !acc.alarm
	console.log(777, 'fan ===============',sectionId, start, '=', !alr, !acc.finish, !acc.alarm)
	return { start }
}

module.exports = data
