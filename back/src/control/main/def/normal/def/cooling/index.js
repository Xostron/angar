const alarm = require('./alarm')
const { data: store, wrAchieve, delAchieve, readAcc } = require('@store')
const { msgB } = require('@tool/message')
const mes = require('@dict/message')
const sm = require('@dict/submode')

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
		acc.alarm = true
		return
	}
	acc.alarm = false
	// console.log(1111, section.name, Object.keys(acc.setting ?? {}))
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
	return { start }
}

// Определение подрежима
function submode(building, section, obj, s, se, seB, alr, acc) {
	// Минимальная температура продукта (ограничение по температуре задания)
	acc.tprdMin = obj.retain?.[building._id]?.cooling?.tprdMin ?? null

	// ========= Доп. Охлаждение 2 =========
	const x2 = acc.tprdMin + s.mois.max
	// set
	if (x2 <= seB.tprd && acc?.submode?.[0] === sm?.cooling?.[0]) acc.submode = sm.cooling2
	// reset
	if (x2 - s.cooling.hysteresisIn > seB.tprd && acc?.submode?.[0] === sm?.cooling2?.[0]) acc.submode = sm.cooling
	// check
	if (acc?.submode?.[0] === sm?.cooling2?.[0]) {
		acc.setting = { cooling: s.cooling, mois: { ...s.mois, outMax: s.mois.outMax2, differenceMin: s.mois?.differenceMin2 } }
		return
	}

	// ========= Лечение =========
	// set
	if (s.mois.humidity + s.cure.hysteresisJump < seB.hin && acc?.submode?.[0] === sm?.cooling?.[0]) acc.submode = sm.cure
	// reset
	if ((s.mois.humidity > seB.hin || seB.tprd > acc.tgt + s.cooling.hysteresisIn) && acc?.submode?.[0] === sm?.cure?.[0]) acc.submode = sm.cooling
	// Дополнительно
	if (seB.tprd + 0.2 <= acc.tgt && acc?.submode?.[0] === sm?.cure?.[0]) acc.setting.cooling.differenceValue = 0
	else if (seB.tprd > acc.tgt && acc?.submode?.[0] === sm?.cure?.[0]) acc.setting.cooling.differenceValue = s.cure.differenceValue
	// check
	if (acc?.submode?.[0] === sm?.cure?.[0]) {
		acc.setting = { cooling: { ...s.cooling, ...s.cure }, mois: s.mois }
		return
	}

	// =========Охлаждение - по умолчанию =========
	acc.submode = sm.cooling
	acc.setting = { cooling: s.cooling, mois: s.mois }
}

function target(building, section, obj, s, se, seB, alr, acc) {
	// Температура задания канала
	acc.tcnl = seB.tprd - acc.setting.cooling.differenceValue
	if (acc.tcnl < acc.setting.cooling.minChannel) acc.tcnl = acc.setting.cooling.minChannel

	// Задание на сутки
	// Момент запуска режима - Температура задания продукта
	if (acc?.tgt === undefined) {
		acc.tgt = seB.tprd - acc.setting.cooling.decrease
		if (acc.tgt < acc.setting.cooling.target) acc.tgt = acc.setting.cooling.target
	}
	// Пересчет в полночь
	if (new Date().getHours() == 0 && !acc.mdnt) {
		acc.mdnt = true
		acc.tgt = acc.tgt - acc.setting.cooling.decrease
		if (seB.tprd - acc.setting.cooling.max > acc.tgt) acc.tgt = seB.tprd - acc.setting.cooling.max
		if (acc.tgt < acc.setting.cooling.target) acc.tgt = acc.setting.cooling.target
	}
	if (new Date().getHours() != 0) acc.mdnt = false

	// Фиксация минимальной температуры продукта (ограничение по температуре задания)
	acc.tprdMin = acc.tprdMin === null ? seB.tprd : acc.tprdMin
	acc.tprdMin = seB.tprd < acc.tprdMin ? seB.tprd : acc.tprdMin
	acc.tprdMin = acc.tprdMin < acc.tgt ? acc.tgt : acc.tprdMin
	console.log('Мин темп продукта', acc.tprdMin)
}

function message(building, section, obj, s, se, seB, alr, acc) {
	// Продукт достиг температуры задания*****************************************
	// В режиме лечения - Продукт достиг не активен
	if (seB.tprd <= acc.tgt && !acc.finish && acc.submode?.[0] !== sm.cure[0]) {
		acc.finish = true
		wrAchieve(building._id, 'cooling', msgB(building, 15))
	}

	// Сброс: 1)темп продукта вышла из зоны   2)если перешли в подрежим лечения
	if (seB.tprd - s.cooling.hysteresisIn > acc.tgt || acc.submode?.[0] === sm.cure[0]) {
		acc.finish = false
		delAchieve(building._id, 'cooling', mes[15].code)
	}

	wrAchieve(building._id, 'cooling', {
		...msgB(building, 150),
		msg: `t задания канала = ${acc.tcnl.toFixed(1)} °С, t задания продукта = ${acc.tgt.toFixed(1)} °С`,
	})
}

module.exports = data
