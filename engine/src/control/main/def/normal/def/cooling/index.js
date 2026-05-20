const alarm = require('./alarm')
const { submode, target, message } = require('./middlew')
const { data: store, readAcc } = require('@store')
const sm = require('@dict/submode')
const { isCombiCold } = require('@tool/combi/is')

// Автоматический режим: Хранение
const data = {
	// Аварии режима
	alarm,
	// Логика включения клапанов
	valve,
	// Логика включения вентиляторов
	fan,
	// Данные от охлаждения на Доп. аварии (Антивьюга, работа клапанов и т.д.)
	// toAlrS: (s, sectionId, acc) => ({ exclude: '' }),
	// Данные от охлаждения на Доп. функции (контроль вентиляции, обогрев клапанов и т.д.)
	toExtra: (s, alarm) => ({ fanOff: alarm, alwaysFan: null }),
	// Промежуточные расчеты по секции (если такие возникнут)
	middlew: (building, section, obj, s, se, seB, alr, acc) => {},
	// Промежуточные расчеты по складу
	middlewB,
}

function middlewB(building, obj, s, seB, am, acc, alrBld) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = seB
	// Вычисление подрежима
	submode(building, obj, s, seB, acc)
	// Вычисления
	target(building, obj, s, seB, acc, alrBld)
	// Сообщения
	message(building, obj, s, seB, am, acc)
}

function valve(bld, idS, obj, m, s, se, am, acc, isCO2work, alr) {
	const open =
		acc?.submode?.[0] === sm.heat[0]
			? (se.tcnl < acc.tcnl - acc?.setting?.cooling?.hysteresisIn ?? 0.3)
			: (se.tcnl > acc.tcnl + acc?.setting?.cooling?.hysteresisIn ?? 0.3)
	const close =
		acc?.submode?.[0] === sm.heat[0]
			? (se.tcnl > acc.tcnl + acc?.setting?.cooling?.hysteresisIn ?? 0.3)
			: (se.tcnl < acc.tcnl - acc?.setting?.cooling?.hysteresisIn ?? 0.3)

	const forceCls = acc.finish && !isCO2work
	// const forceOpn = heatOpen(bld, idS, obj, m, acc, am, s, alr)
	const forceOpn = false
	// Комби-холод + удаление СО2 - открыть клапан на %
	const sp = isCombiCold(bld, am, s) && isCO2work ? (s?.co2?.spv ?? null) : null
	// console.log('\tКлапаны, режим хранение, секция', acc)
	console.table(
		[{ open, close, forceCls, forceOpn, sp }],
		['open', 'close', 'forceCls', 'forceOpn', 'sp'],
	)
	return { open, close, forceCls, forceOpn, sp }
}

function fan(s, se, alr, idS, acc) {
	// Условие пуска ВНО: нет аварии И {задание продукта не достигнуто ИЛИ удаление СО2}
	const alright = !acc.finish
	const start = !alr && alright
	return { start }
}

module.exports = data
