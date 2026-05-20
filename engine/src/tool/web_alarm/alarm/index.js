const { history, critical, count } = require('./fn')
const { signal, signalB } = require('./fn/signal')
const { banner, bannerB } = require('./fn/banner')
const { isCombiCold } = require('@tool/combi/is')
const { bar, barB } = require('./fn/bar')
const { data: store } = require('@store')

function alarm(obj) {
	const { data, retain, value } = obj
	const r = {
		// Все сообщения [страница "Сигналы"]
		signal: {},
		// События достижения задания авторежима [страница "Секции"]
		achieve: {},
		// Таймер запретов
		timer: {},
		// Боковая панель аварий для секции
		bar: {},
		// Боковая панель аварий склада (+ карточка склада)
		barB: {},
		// Счетчик аварий
		count: {},
		// Баннер - всплывающие окна
		banner: {},
		// Для мониторинга (критические, аварийные, информационные)
		monit: { critical: {} },
		// statistic history (critical:[] критические аварии,
		// event:[] информационные сообщения)
		history: { critical: [], event: [], achieve: [] },
	}

	// Таймер запретов
	r.timer = { ...store.alarm.timer }
	for (const bld of data.building) {
		// Склад запущен
		const start = retain?.[bld._id]?.start
		// Авторежим
		const am = retain?.[bld._id]?.automode
		// События достижения задания в авторежиме
		const isCC = isCombiCold(bld, am, store.calcSetting[bld._id])
		r.achieve ??= {}
		r.achieve[bld._id] ??= {}
		if (bld.type === 'cold')
			r.achieve[bld._id] = Object.values(store.alarm?.achieve?.[bld._id]?.[bld.type] ?? {})
		if (bld.type === 'normal' || (bld.type === 'combi' && !isCC))
			r.achieve[bld._id] = Object.values(store.alarm?.achieve?.[bld._id]?.[am] ?? {})
		if (bld.type === 'combi' && isCC)
			r.achieve[bld._id] = Object.values(store.alarm?.achieve?.[bld._id]?.[bld.type] ?? {})
		// Для всех складов: сообщение Склад выключен
		if (store.alarm?.achieve?.[bld._id]?.building?.datestop)
			r.achieve[bld._id].push(store.alarm?.achieve?.[bld._id]?.building?.datestop)
		if (store.alarm?.achieve?.[bld._id]?.building?.sectOff)
			r.achieve[bld._id].push(store.alarm?.achieve?.[bld._id]?.building?.sectOff)
		r.achieve[bld._id].sort((a, b) => a.order - b.order)

		// аварии по секции
		for (const section of data.section) {
			if (section.buildingId != bld._id) continue
			signal(r, bld, section, am)
			bar(r, bld, section, am, start)
			banner(r, bld, section, am)
		}
		// аварии общие склада
		signalB(r, bld, am, data)
		barB(r, bld, am)
		bannerB(r, bld)
	}
	// Счетчик текущих аварий (карточка склада)
	count(r)
	// История для логов
	history(r, data.building)
	// Мониторинг: критические аварии
	critical(r)
	return r
}

module.exports = alarm
