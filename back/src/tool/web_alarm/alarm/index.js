const { barB, bar, bannerB, banner, signalB, signal, count } = require('./fn')
const { data: store } = require('@store')
const defClear = require('./clear')

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
		history: { critical: [], event: [] },
	}

	// Таймер запретов (слабое клонирование)
	r.timer = { ...store.alarm.timer }
	for (const bld of data.building) {
		// Склад запущен
		const start = retain?.[bld._id]?.start
		// Склад запущен
		const am = retain?.[bld._id]?.automode
		// События достижения задания в авторежиме
		r.achieve ??= {}
		r.achieve[bld._id] ??= {}
		r.achieve[bld._id] =
			bld.type == 'cold'
				? Object.values(store.alarm?.achieve?.[bld._id]?.[bld.type] ?? {})
				: Object.values(store.alarm?.achieve?.[bld._id]?.[am] ?? {})
		// Для всех складов: сообщение Склад выключен
		if (store.alarm?.achieve?.[bld._id]?.building?.datestop) r.achieve[bld._id].push(store.alarm?.achieve?.[bld._id]?.building?.datestop)

		r.achieve[bld._id].sort((a, b) => a.order - b.order)
		// Режимы работы секций
		const sumMode = []
		// аварии по секции
		for (const section of data.section) {
			if (section.buildingId != bld._id) continue
			signal(r, bld, section, am)
			bar(r, bld, section, am, start)
			banner(r, bld, section, am)
			sumMode.push(retain?.[bld._id]?.mode?.[section._id])
		}
		// аварии общие склада
		signalB(r, bld, am, data)
		barB(r, bld, am)
		bannerB(r, bld)
		// Наличие хотя бы одной секции в авто
		const sumAuto = sumMode.some((el) => el === true)

		// Очистка событий и таймеров запрета склада
		defClear[bld.type](bld, r, { am, start, sumAuto })
	}
	// Счетчик текущих аварий (карточка склада)
	count(r, value.total, data.building)

	// История для логов
	history(r)
	// Мониторинг: критические аварии
	critical(r)
	return r
}

// Данные отправляемые в логирование
function history(r) {
	for (const bld in r.signal) {
		// Критические аварии
		r.history.critical = r.history.critical.concat(...r.signal[bld].filter((el) => el.count))
		// Инофрмационные сообщения
		r.history.event = r.history.event.concat(...r.signal[bld].filter((el) => !el.count))
	}
}

// Данные отправляемы в мониторинг: критические аварии
function critical(r) {
	for (const bld in r.signal) {
		// Критические аварии кроме module (Модуль не в сети)
		const t = r.signal[bld].filter((el) => el.count && el.code !== 'module')
		// Замена нескольких сообщений не в сети на одно сообщение (Пропала связь)
		const m = r.signal[bld].filter((el) => el.code === 'module')
		if (m.length > 1) {
			const o = { ...m[0], title: '', msg: 'Обратитесь в сервисный центр (пропала связь с модулем)' }
			t.push(o)
		} else {
			m.length ? t.push(m[0]) : null
		}
		r.monit.critical[bld] = t
	}
}

module.exports = alarm
