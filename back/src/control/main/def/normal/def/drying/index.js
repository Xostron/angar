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
	toAlrS: (s) => ({ exclude: s.drying.ventilation }),
	// Данные от сушки на Доп. функции (контроль вентиляции, обогрев клапанов и т.д.)
	toExtra: (s, alarm) => ({ fanOff: alarm && !s.drying.ventilation, alwaysFan: s.drying.ventilation }),
	// Промежуточные расчеты по секции
	middlew: (building, section, obj, s, se, seB, alr, acc) => {},
	// Промежуточные расчеты по складу
	middlewB,
}

function middlewB(building, obj, s, seB, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = seB

	// TODO: Как реагировать при обвале датчиков? Отключено
	// if (tout === null || hout === null) {
	// 	acc.alarm = true
	// 	return
	// }
	// acc.alarm = false
	// ************************************************
	if (tout < s.drying.channelMin) {
		wrAchieve(building._id, 'drying', {
			date: new Date(),
			code: 'drying-1',
			msg: `t задания канала = ${s.drying.channelMin} °С, t задания продукта = ${tprd} °С`,
		})
		acc.f1 = true
	} else {
		acc.f1 = false
		delAchieve(building._id, 'drying', 'drying-1')
	}
	// ************************************************
	if (tout >= s.drying.channelMin && tout < s.drying.channelMax) {
		wrAchieve(building._id, 'drying', {
			date: new Date(),
			code: 'drying-2',
			msg: `t задания канала = ${tout} °С, t задания продукта = ${tprd} °С`,
		})
		acc.f2 = true
	} else {
		acc.f2 = false
		delAchieve(building._id, 'drying', 'drying-2')
	}
	// ************************************************
	if (tout >= s.drying.channelMax) {
		wrAchieve(building._id, 'drying', {
			date: new Date(),
			code: 'drying-3',
			msg: `t задания канала = ${s.drying.channelMax} °С, t задания продукта = ${seB.tprd} °С`,
		})
		acc.f3 = true
	} else {
		acc.f3 = false
		delAchieve(building._id, 'drying', 'drying-3')
	}
}

function valve(s, se) {
	const open = se.tcnl > s.drying.channelMin + s.drying.hysteresisIn
	const close = se.tcnl < s.drying.channelMin - s.drying.hysteresisIn
	const forceOpn = s.drying.channelMin < se.tout && s.drying.channelMax > se.tout
	// console.log(1111, 'roma', 'Клапаны', `Открыть ${open}, Закрыть ${close}, Открыть форс ${forceOpn}`)
	return { open, close, forceOpn, forceCls: false }
}
function fan(s, se, alr) {
	const forceRun = s.drying.channelMin < se.tout && s.drying.channelMax > se.tout && !alr
	// TODO если клапана закрыты при работающих вентиляторах более Х мин. , нужно ли выключать вентиляторы?
	// сообщение: "Температура канала "
	const start = s.drying.ventilation || forceRun || !alr
	// console.log(2222, `Вентиляторы в работе = ${start} |`, `Нет аварий ${!alr}, force ${forceRun}, Вент всегда в работе ${s.drying.ventilation}`)
	return { start }
}
module.exports = data
