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
	// Промежуточные расчеты по секции (если такие возникнут)
	middlew: (building, section, obj, s, se, seB, alr, acc) => {},
	// Промежуточные расчеты по складу
	middlewB,
}

function middlewB(building, obj, s, seB, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = seB
	// Вычисление подрежима
	submode(building, obj, s, seB, acc)
	// Вычисления
	target(building, obj, s, seB, acc)
	// Сообщения
	message(building, obj, s, seB, acc)
}

function valve(s, se, sectionId, acc, extraCO2) {
	const open = se.tcnl > acc.tcnl + s.cooling.hysteresisIn
	const close = se.tcnl < acc.tcnl - s.cooling.hysteresisIn
	const forceCls = acc.finish && !extraCO2.start

	console.log(
		'\tКлапаны хранение',
		'open',
		open,
		'close',
		close,
		'forceCls',
		forceCls,
		'extraCO2.start',
		extraCO2
	)
	return { open, close, forceCls, forceOpn: false }
}

function fan(s, se, alr, sectionId, acc) {
	// Условие пуска ВНО: нет аварии И {задание продукта не достигнуто ИЛИ удаление СО2}
	const alright = !acc.finish
	const start = !alr && alright
	return { start }
}

module.exports = data
