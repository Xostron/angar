const { wrAchieve, delAchieve, updAchieve } = require('@tool/message/achieve')
const { runTime } = require('@tool/command/time')
const { msgB } = require('@tool/message')
const mes = require('@dict/message')
const sm = require('@dict/submode')
const { isCombiCold } = require('@tool/combi/is')
const isChange = require('@tool/is_change')

/**
 * Определение подрежима
 */
function submode(bld, obj, s, seB, acc) {
	if (!s) return
	// Минимальная температура продукта (ограничение по температуре задания)
	acc.tprdMin = obj.retain?.[bld._id]?.cooling?.tprdMin ?? null
	// ========= Доп. Охлаждение + =========
	const x2 = acc.tprdMin + s.mois.max
	// set
	if (x2 <= seB.tprd && (acc?.submode?.[0] === sm.cooling[0] || !acc?.submode?.[0]))
		acc.submode = sm.cooling2
	// reset
	if (x2 - s.cooling.hysteresisIn > seB.tprd && acc?.submode?.[0] === sm.cooling2[0])
		acc.submode = sm.cooling
	// check
	if (acc?.submode?.[0] === sm.cooling2[0]) {
		// console.log(11, 'check охлаждение+')
		acc.setting = {
			cooling: s.cooling,
			mois: { ...s.mois, outMax: s.mois.outMax2, differenceMin: s.mois?.differenceMin2 },
		}
		return
	}

	// ========= Нагрев =========
	// set
	if (
		seB.tprd <= s.cooling.target - s.heat.hysteresisIn &&
		(acc?.submode?.[0] === sm.cooling[0] ||
			!acc?.submode?.[0] ||
			(acc?.submode?.[0] === sm.cure[0] &&
				seB.tout > seB.tprd + s.cooling.hysteresisOut + s.heat.differenceMax))
	) {
		console.log(1, 'heat set')
		acc.submode = sm.heat
	}
	// reset
	if (seB.tprd >= s.cooling.target && acc?.submode?.[0] === sm.heat[0]) {
		console.log(1, 'heat reset')
		acc.submode = sm.cooling
	}

	// ========= Лечение =========
	// set
	// console.log(22, 'set лечение', s.mois.humidity + s.cure.hysteresisJump, '<', seB.hin, '&&', seB.tprd, '<=', acc.tgt, '&&', acc?.submode?.[0],'===',sm?.cooling?.[0])
	if (
		s.mois.humidity + s.cure.hysteresisJump < seB.hin &&
		seB.tprd <= acc.tgt &&
		(acc?.submode?.[0] === sm.cooling[0] ||
			!acc?.submode?.[0] ||
			(acc?.submode?.[0] === sm.heat[0] && seB.tout < seB.tprd + s.heat.differenceMax))
	) {
		console.log(3, 'cure set')
		acc.submode = sm.cure
	}
	// reset
	// console.log(22, 'reset лечение', s.mois.humidity, '>', seB.hin, '||', seB.tprd, '>', acc.tgt+s.cooling.hysteresisIn, '&&', acc?.submode?.[0],'===',sm?.cure?.[0])
	if (
		(s.mois.humidity > seB.hin || seB.tprd > acc.tgt + s.cooling.hysteresisIn) &&
		acc?.submode?.[0] === sm?.cure?.[0]
	) {
		console.log(3, 'cure reset')
		acc.submode = sm.cooling
	}

	/* ================== ACCEPT ================== */
	// accept heat
	if (acc?.submode?.[0] === sm.heat[0]) {
		acc.setting = {
			cooling: {
				...s.cooling,
				hysteresisIn: s.heat.hysteresisIn,
				minChannel: s.heat.minChannel,
				differenceMax: s.heat?.differenceMax,
				differenceMin: s.heat?.differenceMin,
				differenceValue: s.heat?.differenceValue,
			},
			mois: { ...s.mois, outMax: s.heat.outMax },
		}
		console.log(2, 'heat set')
		return
	}

	// accept cure
	if (acc?.submode?.[0] === sm?.cure?.[0]) {
		// console.log(2, 'check лечение')
		acc.setting = { cooling: { ...s.cooling, ...s.cure }, mois: s.mois }
		// Уменьшение разницы продукт-канал
		if (seB.tprd + 0.2 <= acc.tgt) acc.setting.cooling.differenceValue = 0
		else if (seB.tprd > acc.tgt) acc.setting.cooling.differenceValue = s.cure.differenceValue
		console.log(4, 'cure set')
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
function target(bld, obj, s, seB, acc) {
	if (!Object.keys(acc ?? {}).length || !acc?.setting) return
	// Температура задания канала (? нагрев : охлаждение(лечение, охл+))
	acc.tcnl =
		acc?.submode?.[0] === sm.heat[0]
			? seB.tprd + acc.setting.cooling.differenceValue
			: seB.tprd - acc.setting.cooling.differenceValue
	if (acc.tcnl < acc.setting.cooling.minChannel) acc.tcnl = acc.setting.cooling.minChannel
	acc.tcnl = isNaN(acc.tcnl) ? undefined : +acc.tcnl.toFixed(1)
	// Задание на сутки

	// Момент запуска режима - Температура задания продукта
	if (acc?.tgt === undefined || acc?.isChange(s.cooling.decrease, s.cooling.target)) {
		acc.tgt = seB.tprd - acc.setting.cooling.decrease
		if (acc.tgt < acc.setting.cooling.target) acc.tgt = acc.setting.cooling.target
		console.log(
			`Пересчет задания (Склад вкл/выкл): задание=${acc.tgt}, датчик продукта=${seB.tprd}`,
		)
		// Указанные настройки изменились?
		acc.isChange = isChange(s.cooling.decrease, s.cooling.target)
	}
	// Пересчет в полночь TODO
	if (new Date().getHours() == 0 && !acc.mdnt) {
		acc.mdnt = true
		acc.tgt = acc.tgt - acc.setting.cooling.decrease
		if (seB.tprd - acc.setting.cooling.max > acc.tgt)
			acc.tgt = seB.tprd - acc.setting.cooling.max
		if (acc.tgt < acc.setting.cooling.target) acc.tgt = acc.setting.cooling.target
		console.log(`Пересчет в полночь: задание=${acc.tgt}, датчик продукта=${seB.tprd}`)
	}
	if (new Date().getHours() != 0) acc.mdnt = false

	// Фиксация минимальной температуры продукта (ограничение по температуре задания)
	acc.tprdMin = acc.tprdMin === null ? seB.tprd : acc.tprdMin
	acc.tprdMin = seB.tprd < acc.tprdMin ? seB.tprd : acc.tprdMin
	acc.tprdMin = acc.tprdMin < acc.tgt ? acc.tgt : acc.tprdMin
	// console.log(3300, 'Мин темп продукта', acc.tprdMin)
}

/**
 * Сообщения достиг температуры
 */
function message(bld, obj, s, seB, am, acc) {
	// Если склад комби в режиме холода выходим из проверки по достижению Тзадания
	// Для данного склада проверка происходит в src\control\main\def\cold\main\check\index.js
	if (isCombiCold(bld, am, s)) return
	if (!s) return

	// Продукт достиг температуры задания:
	// 1 Тпрод меньше-равно заданию
	// 2 подрежим не лечение И не нагрев
	if (
		seB.tprd <= acc.tgt &&
		!acc.finish &&
		acc.submode?.[0] !== sm.cure[0] &&
		acc?.submode?.[0] !== sm.heat[0]
	) {
		// Истекшее время "Продукт достиг задания"
		acc.finish = obj.retain?.[bld._id]?.cooling?.finish
			? obj.retain?.[bld._id]?.cooling?.finish
			: new Date()
		wrAchieve(bld._id, 'cooling', msgB(bld, 15, runTime(acc.finish, 1)))
	}

	// Сброс:
	// 1 темп продукта вышла из зоны
	// 2 подрежим лечения
	// 3 подрежим нагрева
	if (
		seB.tprd - s.cooling.hysteresisIn > acc.tgt ||
		acc.submode?.[0] === sm.cure[0] ||
		acc?.submode?.[0] === sm.heat[0]
	) {
		acc.finish = null
		delAchieve(bld._id, 'cooling', mes[15].code)
	}

	const txt = `T зад. канала = ${acc.tcnl?.toFixed(1) ?? '--'}°C. Т зад. прод. = ${acc.tgt?.toFixed(1) ?? '--'}°C`
	wrAchieve(bld._id, 'cooling', msgB(bld, 150, txt))

	// Обновление времени в сообщении "Продукт достиг температуры"
	if (acc.finish) wrAchieve(bld._id, 'cooling', msgB(bld, 15, runTime(acc.finish, 1)))
}

module.exports = { submode, target, message }
