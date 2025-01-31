const alarm = require('./alarm')
const { data: store, wrAchieve, delAchieve, readAcc } = require('@store')
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
	// TODO: Как реагировать при обвале датчиков?
	if (tout === null || hout === null) {
		acc.alarm = true
		return
	}
	acc.alarm = false

	// Вычисление подрежима
	target(s, se, seB, alr, acc)
	// Вычисление подрежима
	submode(s, se, seB, alr, acc)

	// Настройки авто в зависимости от подрежима

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
		...msgB(building, 150),
		msg: `t задания канала = ${acc.tcnl.toFixed(1)} °С, t задания продукта = ${acc.tgt.toFixed(1)} °С`,
	})
}

function valve(s, se, sectionId, acc) {
	const open = se.tcnl > acc.tcnl + s.cooling.hysteresisIn
	const close = se.tcnl < acc.tcnl - s.cooling.hysteresisIn
	const forceCls = acc.finish || acc.alarm
	return { open, close, forceCls, forceOpn: false }
}

function fan(s, se, alr, sectionId, acc) {
	const start = !alr && !acc.finish && !acc.alarm
	return { start }
}

// Определение подрежима
function submode(s, se, seB, alr, acc) {
	acc.setting = {}
	// Подрежимы
	// Охлаждение 2
	if (acc.tgt + s.mois.max <= seB.tprd) {
		acc.state = sm.cooling2
		acc.setting = { cooling: s.cooling, mois: { ...s.mois, outMax: s.mois.outMax2, differenceMin: s.mois.differenceMin2 } }
		return
	}
	// Другие подрежимы
	if (acc.tgt + s.mois.max - s.cooling.hysteresisIn > seB.tprd) {
		// Лечение
		if (seB.hin >= s.mois.humidity) {
			acc.state = sm.cure
			acc.setting = { cooling: { ...s.cooling, ...s.cure }, mois: s.mois }
			return
		}
		// Охлаждение
		if (seB.hin - s.mois.hysteresisRel < s.mois.humidity) acc.state = sm.cooling
		acc.setting = { cooling: s.cooling, mois: s.mois }
	}
}

function target(s, se, seB, alr, acc) {
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
}

module.exports = data

// cure
// {
// 	differenceMin: 1,
// 	differenceValue: 3,
// 	hysteresisOut: 1,
// 	hysteresisIn: 0.3,
// 	differenceMax: 25,
// 	min: -10,
// 	prd: 'onion'
//   }

// cooling
// {
// 	decrease: 3,
// 	target: 9,
// 	differenceMin: 2,
// 	minChannel: 2,
// 	differenceMax: 25,
// 	max: 2,
// 	differenceValue: 2,
// 	hysteresisIn: 0.3,
// 	minOut: -10,
// 	hysteresisOut: 1,
// 	prd: 'onion'
//   }

// mois
// {
// 	outMax: 80,
// 	outMin: 10,
// 	humidity: 80,
// 	differenceMin: 0,
// 	differenceMax: 10,
// 	max: 1,
// 	hysteresisRel: 2.5,
// 	hysteresisAbs: 1,
// 	prd: 'onion'
//   }

const sm = {
	cooling: ['cooling', 'Охлаждение'],
	cure: ['cure', 'Лечение'],
	cooling2: ['cooling2', 'Охлаждение 2'],
}

// {
// 	tout: -8.7,
// 	hout: 0,
// 	hAbsOut: 0,
// 	tin: 13,
// 	hin: 11.5,
// 	hAbsIn: 5.1,
// 	tprd: 10.7,
// 	tcnl: 11.3,
// 	cooler: { tprd: 10.7, co2: null, clr: null }
//   }
