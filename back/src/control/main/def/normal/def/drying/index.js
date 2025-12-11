const { msgB } = require('@tool/message')
const alarm = require('./alarm')
const { wrAchieve, delAchieve } = require('@tool/message/achieve')

// Автоматический режим: Сушка
const data = {
	// Аварии режима
	alarm,
	// Логика включения клапанов
	valve,
	// Логика включения вентиляторов
	fan,
	// Данные от сушки на Доп. аварии (Антивьюга, работа клапанов и т.д.)
	toAlrS: (s) => ({ exclude: null }),
	// Данные от сушки на Доп. функции (контроль вентиляции, обогрев клапанов и т.д.)
	toExtra: (s, alarm) => ({
		fanOff: alarm,
		alwaysFan: s.vent.mode === 'on',
	}),
	// Промежуточные расчеты по секции
	middlew: (bld, section, obj, s, se, seB, alr, acc) => {},
	// Промежуточные расчеты по складу
	middlewB,
}

function middlewB(bld, obj, s, seB, am, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = seB

	// ************************************************
	if (tout < s.drying.channelMin) {
		wrAchieve(
			bld._id,
			'drying',
			msgB(
				bld,
				153,
				`t задания канала = ${s.drying.channelMin} °С, t задания продукта = ${tprd} °С`
			)
		)
		acc.f1 = true
	} else {
		acc.f1 = false
		delAchieve(bld._id, 'drying', 'drying1')
	}
	// ************************************************
	if (tout >= s.drying.channelMin && tout < s.drying.channelMax) {
		wrAchieve(
			bld._id,
			'drying',
			msgB(bld, 154, `t задания канала = ${tout} °С, t задания продукта = ${tprd} °С`)
		)
		acc.f2 = true
	} else {
		acc.f2 = false
		delAchieve(bld._id, 'drying', 'drying2')
	}
	// ************************************************
	if (tout >= s.drying.channelMax) {
		wrAchieve(
			bld._id,
			'drying',
			msgB(
				bld,
				155,
				`t задания канала = ${s.drying.channelMax} °С, t задания продукта = ${seB.tprd} °С`
			)
		)
		acc.f3 = true
	} else {
		acc.f3 = false
		delAchieve(bld._id, 'drying', 'drying-3')
	}
}

function valve(s, se, sectionId, acc, CO2work) {
	const open = se.tcnl > s.drying.channelMin + s.drying.hysteresisIn
	const close = se.tcnl < s.drying.channelMin - s.drying.hysteresisIn
	const forceOpn = s.drying.channelMin < se.tout && s.drying.channelMax > se.tout
	console.log('\tКлапаны сушка', 'open', open, 'close', close, 'forceOpn', forceOpn)
	return { open, close, forceOpn, forceCls: false }
}
function fan(s, se, alr, sectionId, acc) {
	const forceByTout = s.drying.channelMin < se.tout && s.drying.channelMax > se.tout && !alr
	const force = forceByTout
	const start = !alr || force
	return { start }
}
module.exports = data
