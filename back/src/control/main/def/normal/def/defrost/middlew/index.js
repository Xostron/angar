const { wrAchieve, delAchieve, updAchieve } = require('@tool/message/achieve')
const { elapsedTime, runTime } = require('@tool/command/time')
const { msgB } = require('@tool/message')
const mes = require('@dict/message')
const sm = require('@dict/submode')
const { isCombiCold } = require('@tool/combi/is')
const { data: store } = require('@store')

/**
 * Настройки подрежима Дефростация (Нагрев)
 */
function submode(bld, obj, s, seB, acc) {
	if (!s) return
	// check
	if (acc?.submode?.[0] === sm.heat[0]) {
		// console.log(11, 'check Нагрев')
		acc.setting = {
			cooling: {
				...s.cooling,
				hysteresisIn: s.heat.hysteresisIn,
				minChannel: s.heat.minChannel,
				differenceMax: s.heat?.differenceMax,
				differenceMin: s.heat?.differenceMin,
			},
			mois: { ...s.mois, outMax: s.heat.outMax },
		}
		return
	}
}

/**
 * Расчет задания
 */
function target(bld, obj, s, seB, acc) {
	if (!Object.keys(acc ?? {}).length || !acc?.setting) return
	// Температура задания канала (? нагрев : охлаждение(лечение, охл+))
	acc.tcnl = seB.tprd
	if (acc.tcnl < acc.setting.cooling.minChannel) acc.tcnl = acc.setting.cooling.minChannel

	// Задание на сутки
	// Момент запуска режима - Температура задания продукта
	if (acc?.tgt === undefined) {
		acc.tgt = seB.tprd - acc.setting.cooling.decrease
		if (acc.tgt < acc.setting.cooling.target) acc.tgt = acc.setting.cooling.target
		console.log(
			`Пересчет задания (Склад вкл/выкл): задание=${acc.tgt}, датчик продукта=${seB.tprd}`,
		)
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
		acc?.submode?.[0] === sm.heat[0]
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
