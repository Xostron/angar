const { wrAchieve, delAchieve, updAchieve } = require('@tool/message/achieve')
const { elapsedTime } = require('@tool/command/time')
const { msgB } = require('@tool/message')
const mes = require('@dict/message')
const sm = require('@dict/submode')

/**
 * Определение подрежима
 */
function submode(building, obj, s, seB, acc) {
	// Минимальная температура продукта (ограничение по температуре задания)
	acc.tprdMin = obj.retain?.[building._id]?.cooling?.tprdMin ?? null

	// ========= Доп. Охлаждение 2 =========
	const x2 = acc.tprdMin + s.mois.max
	// set
	// console.log(11,'set Охлаждение+', x2, '<=', seB.tprd ,'&&', acc?.submode?.[0], '===' ,sm?.cooling?.[0])
	if (x2 <= seB.tprd && acc?.submode?.[0] === sm?.cooling?.[0]) acc.submode = sm.cooling2
	// reset
	// console.log(11,'reset Охлаждение+', x2, '-' ,s.cooling.hysteresisIn, '>' ,seB.tprd ,'&&', acc?.submode?.[0], '===' ,sm?.cooling2?.[0])
	if (x2 - s.cooling.hysteresisIn > seB.tprd && acc?.submode?.[0] === sm?.cooling2?.[0]) acc.submode = sm.cooling
	// check
	if (acc?.submode?.[0] === sm?.cooling2?.[0]) {
		// console.log(11, 'check охлаждение+')
		acc.setting = { cooling: s.cooling, mois: { ...s.mois, outMax: s.mois.outMax2, differenceMin: s.mois?.differenceMin2 } }
		return
	}

	// ========= Лечение =========
	// set
	// console.log(22, 'set лечение', s.mois.humidity + s.cure.hysteresisJump, '<', seB.hin, '&&', seB.tprd, '<=', acc.tgt, '&&', acc?.submode?.[0],'===',sm?.cooling?.[0])
	if (s.mois.humidity + s.cure.hysteresisJump < seB.hin && seB.tprd <= acc.tgt && acc?.submode?.[0] === sm?.cooling?.[0]) {
		acc.submode = sm.cure
	}
	// reset
	// console.log(22, 'reset лечение', s.mois.humidity, '>', seB.hin, '||', seB.tprd, '>', acc.tgt+s.cooling.hysteresisIn, '&&', acc?.submode?.[0],'===',sm?.cure?.[0])
	if ((s.mois.humidity > seB.hin || seB.tprd > acc.tgt + s.cooling.hysteresisIn) && acc?.submode?.[0] === sm?.cure?.[0]) {
		acc.submode = sm.cooling
	}
	// Уменьшение разницы продукт-канал
	if (seB.tprd + 0.2 <= acc.tgt && acc?.submode?.[0] === sm?.cure?.[0]) acc.setting.cooling.differenceValue = 0
	else if (seB.tprd > acc.tgt && acc?.submode?.[0] === sm?.cure?.[0]) acc.setting.cooling.differenceValue = s.cure.differenceValue
	// check
	if (acc?.submode?.[0] === sm?.cure?.[0]) {
		// console.log(2, 'check лечение')
		acc.setting = { cooling: { ...s.cooling, ...s.cure }, mois: s.mois }
		return
	}

	// =========Охлаждение - по умолчанию =========
	acc.submode = sm.cooling
	acc.setting = { cooling: s.cooling, mois: s.mois }
	// console.log(333, 'Охлаждение', acc.submode)
}

/**
 * Расчет задания
 */
function target(building, obj, s, seB, acc) {
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
	// console.log(11, 'Мин темп продукта', acc.tprdMin)
}

/**
 * Сообщения
 */
function message(building, obj, s, seB, acc) {
	// Продукт достиг температуры задания*****************************************
	// В режиме лечения - Продукт достиг не активен
	if (seB.tprd <= acc.tgt && !acc.finish && acc.submode?.[0] !== sm.cure[0]) {
		// Истекшее время "Продукт достиг задания"
		const elapsed = elapsedTime(obj.retain?.[building._id]?.cooling?.finish ?? null)
		// Защита против потери счетчика при перезагрузке pos
		if (elapsed) acc.finish = obj.retain?.[building._id]?.cooling?.finish
		else acc.finish = new Date()

		wrAchieve(building._id, 'cooling', msgB(building, 15))
	}

	// Сброс: 1)темп продукта вышла из зоны   2)если перешли в подрежим лечения
	if (seB.tprd - s.cooling.hysteresisIn > acc.tgt || acc.submode?.[0] === sm.cure[0]) {
		acc.finish = null
		delAchieve(building._id, 'cooling', mes[15].code)
	}

	wrAchieve(building._id, 'cooling', {
		...msgB(building, 150),
		msg: `t задания канала = ${acc.tcnl.toFixed(1)} °С, t задания продукта = ${acc.tgt.toFixed(1)} °С`,
	})

	// Обновление времени в сообщении "Продукт достиг температуры"
	if (acc.finish) {
		// Истекшее время "Продукт достиг задания"
		const elapsed = elapsedTime(obj.retain?.[building._id]?.cooling?.finish ?? null)
		const msg = elapsed ? mes[15].msg + ' ' + elapsed : null
		if (!msg) return
		updAchieve(building._id, 'cooling', 'finish', { msg })
	}
}

module.exports = { submode, target, message }
