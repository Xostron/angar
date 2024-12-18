const alarm = require('./alarm')
const { data: store, wrAchieve, delAchieve } = require('@store')
const { msgB } = require('@tool/message')
const mes = require('@dict/message')

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

function middlew(building, section, s, se, seB, alr, acc) {
	const { tout, hout, hAbsOut, hAbsIn, tprd, tcnl } = se
	// TODO: Как реагировать при обвале датчиков? Отключено
	// if (
	// 	typeof tprd !== 'number' ||
	// 	typeof tcnl !== 'number' ||
	// 	typeof tout !== 'number' ||
	// 	typeof hout !== 'number' ||
	// 	typeof hAbsOut !== 'number' ||
	// 	typeof hAbsIn !== 'number'
	// ) {
	// 	return
	// }

	// Задание на сутки
	// Момент запуска режима - Температура задания продукта
	if (!acc?.tgt) {
		acc.tgt = seB.tprd - s.cooling.decrease
		if (acc.tgt < s.cooling.target) acc.tgt = s.cooling.target
	}
	// Пересчет в полночь
	if (new Date().getHours() == 0 && !acc.mdnt) {
		acc.mdnt = true
		acc.tgt = acc.tgt - s.cooling.decrease
		if (seB.tprd - s.cooling.max > acc.tgt) acc.tgt = seB.tprd - s.cooling.max
		if (acc.tgt < s.cooling.target) acc.tgt = s.cooling.target
	}
	if (new Date().getHours() != 0) acc.mdnt = false

	// Температура задания канала
	acc.tcnl = seB.tprd - s.cooling.differenceValue
	if (acc.tcnl < s.cooling.minChannel) acc.tcnl = s.cooling.minChannel

	// Продукт достиг температуры задания*****************************************
	if (seB.tprd <= acc.tgt && !acc.finish) {
		acc.finish = true
		wrAchieve(building._id, 'cooling', msgB(building, 15))
	}
	if (seB.tprd - s.cooling.hysteresisIn > acc.tgt) {
		acc.finish = false
		delAchieve(building._id, 'cooling', mes[15].code)
	}
	// ********************************************************

	wrAchieve(building._id, 'cooling', {
		...msgB(building, 16),
		msg: `t задания канала = ${acc.tcnl.toFixed(1)} °С, t задания продукта = ${acc.tgt.toFixed(1)} °С`,
	})
}

function valve(s, se, sectionId, acc) {
	const open = se.tcnl > acc.tcnl + s.cooling.hysteresisIn
	const close = se.tcnl < acc.tcnl - s.cooling.hysteresisIn
	const forceCls = acc.finish
	return { open, close, forceCls, forceOpn: false }
}

function fan(s, se, alr, sectionId, acc) {
	const start = !alr && !acc.finish
	return { start }
}

module.exports = data
