const { data: store } = require('@store')
const { barB, bar, bannerB, banner, signalB, signal, count } = require('./fn')
const defClear = require('./clear')

function alarm(obj) {
	const { data, retain } = obj

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
		// Архив аварий [Страница "Журнал аварий"]
		// log: [],
	}

	// Таймер запретов (слабое клонирование)
	r.timer = { ...store?.alarm?.timer }

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
	count(r)
	return r
}

module.exports = alarm
