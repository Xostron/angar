const { data: store } = require('@store')
const mes = require('@dict/message')

// Аварии на боковой колонке на странице "внутренности" Секции
function bar(r, bld, sect, am, start) {
	// склад выключен, авторежим не выбран - очищаем аварии, сообщения, таймеры запретов авторежима
	if (!am || !start) {
		r.bar ??= {}
		r.bar[bld._id] = {}
		return
	}
	// Боковая панель аварий для секции
	// const d = store.alarm.auto?.[bld._id]?.[am]?.[sect._id]
	const alrClosed = store.alarm?.extralrm?.[bld._id]?.[sect._id]?.alrClosed ?? null
	const antibliz = store.alarm.extralrm[bld._id]?.[sect._id]?.antibliz ?? null
	const alrClosedB = store.alarm?.extralrm?.[bld._id]?.alrClosed ?? null
	const tout1 = store.alarm.auto?.[bld._id]?.[am]?.tout1 ?? null
	const tout2 = store.alarm.auto?.[bld._id]?.[am]?.tout2 ?? null
	const tout3 = store.alarm.auto?.[bld._id]?.[am]?.tout3 ?? null
	const hout1 = store.alarm.auto?.[bld._id]?.[am]?.hout1 ?? null
	const hout2 = store.alarm.auto?.[bld._id]?.[am]?.hout2 ?? null
	const ahout1 = store.alarm.auto?.[bld._id]?.[am]?.ahout1 ?? null
	const ahout2 = store.alarm.auto?.[bld._id]?.[am]?.ahout2 ?? null

	r.bar[bld._id] ??= {}
	r.bar[bld._id][sect._id] ??= {}
	r.bar[bld._id][sect._id].tout ??= []
	r.bar[bld._id][sect._id].hout ??= []

	r.bar[bld._id][sect._id].alrClosed = alrClosed || alrClosedB
	r.bar[bld._id][sect._id].antibliz = antibliz
	if (tout1) r.bar[bld._id][sect._id].tout.push(tout1)
	if (tout2) r.bar[bld._id][sect._id].tout.push(tout2)
	if (tout3) r.bar[bld._id][sect._id].tout.push(tout3)
	if (hout1) r.bar[bld._id][sect._id].hout.push(hout1)
	if (hout2) r.bar[bld._id][sect._id].hout.push(hout2)
	if (ahout1) r.bar[bld._id][sect._id].hout.push(ahout1)
	if (ahout2) r.bar[bld._id][sect._id].hout.push(ahout2)
}

// Аварии на боковой колонке на странице Секции
function barB(r, bld) {
	if (!r.bar?.[bld._id]) return
	for (const key in r.bar[bld._id]) {
		const s = r.bar[bld._id][key]

		r.barB[bld._id] ??= {}
		r.barB[bld._id].tout ??= []
		r.barB[bld._id].hout ??= []
		r.barB[bld._id].antibliz ??= []
		r.barB[bld._id].alrClosed ??= []
		if (s.tout) r.barB[bld._id].tout.push(...s.tout)
		if (s.hout) r.barB[bld._id].hout.push(...s.hout)
		if (s.antibliz) r.barB[bld._id].antibliz.push(s.antibliz)
		if (s.alrClosed) r.barB[bld._id].alrClosed.push(s.alrClosed)
	}
}

// Аварии на странице "Сигналы" (собираем по секции)
function signal(r, bld, sect, am) {
	r.signal[bld._id] ??= []
	// Сообщения: авторежимы, доп. аварии, доп. функции
	// const auto = store.alarm.auto?.[bld._id]?.[am]
	const extralrm = store.alarm.extralrm?.[bld._id]?.[sect?._id]
	const extra = store.alarm?.extra?.[bld._id]?.[sect._id]

	// if (auto) r.signal[bld._id].push(...Object.values(auto))
	if (extralrm) r.signal[bld._id].push(...Object.values(extralrm))
	if (extra) r.signal[bld._id].push(...Object.values(extra))
}

// Аварии на странице "Сигналы" (собираем по складу и суммируем с секциями)
function signalB(r, bld, am, data) {
	r.signal[bld._id] ??= []
	// CO2
	const idS = data.section.filter((el) => el.buildingId === bld._id).map((el) => el._id)
	const idDvc = data.device.filter((el) => idS.includes(el.sectionId)).map((el) => el._id)
	idDvc.forEach((el) => {
		const arr = Object.values(store.alarm?.extralrm?.[bld._id]?.[el] ?? [])
		if (arr.length) r.signal[bld._id].push(...arr)
	})
	// Компрессоры агрегата
	const agg = data.aggregate.filter((el) => el.buildingId === bld._id)
	agg.forEach((doc) => {
		doc.compressorList
			.map((el) => doc._id + ' ' + el._id)
			.forEach((e) => {
				const arr = Object.values(store.alarm?.extralrm?.[bld._id]?.[e] ?? [])
				if (arr.length) r.signal[bld._id].push(...arr)
			})
	})

	const auto = store.alarm.auto?.[bld._id]?.[am]
	const timer = Object.values(r.timer?.[bld._id] ?? {})
	const module = Object.values(store.alarm.module?.[bld._id] ?? {})
	const accel = Object.values(store.alarm.extra?.[bld._id]?.accel ?? {})
	const cable = store.alarm.extra?.[bld._id]?.cable ?? null
	const co2 = store.alarm.extra?.[bld._id]?.co2 ?? null
	const drain = store.alarm.extra?.[bld._id]?.drain ?? null
	const drainRun = store.alarm.extra?.[bld._id]?.drainRun ?? null
	const smoking = store.alarm.extra?.[bld._id]?.smoking ?? null
	const connect = store.alarm.extra?.[bld._id]?.connect ?? null
	// extralrm
	const gen = store.alarm.extralrm?.[bld._id]?.gen ?? null
	const vlvLim = store.alarm?.extralrm?.[bld._id]?.vlvLim ?? null
	const local = store.alarm?.extralrm?.[bld._id]?.local ?? null
	const alrClosed = store.alarm?.extralrm?.[bld._id]?.alrClosed ?? null
	const alrStop = store.alarm?.extralrm?.[bld._id]?.alarm ?? null
	const supply = store.alarm?.extralrm?.[bld._id]?.supply ?? null
	const low = store.alarm?.extralrm?.[bld._id]?.low ?? null
	const deltaMdl = store.alarm?.extralrm?.[bld._id]?.deltaMdl ?? null
	// аварии датчиков склада
	const extralrmS = store.alarm?.extralrm?.[bld._id]?.sensor
	
	if (auto) r.signal[bld._id].push(...Object.values(auto))
	if (timer?.length) r.signal[bld._id].push(...timer)
	if (module?.length) r.signal[bld._id].push(...module)
	if (accel) r.signal[bld._id].push(...accel)
	if (gen) r.signal[bld._id].push(gen)
	if (cable) r.signal[bld._id].push(cable)
	if (vlvLim) r.signal[bld._id].push(vlvLim)
	if (alrClosed) r.signal[bld._id].push(alrClosed)
	if (local) r.signal[bld._id].push(local)
	if (co2) r.signal[bld._id].push(co2)
	if (drain) r.signal[bld._id].push(drain)
	if (drainRun) r.signal[bld._id].push(drainRun)
	if (smoking) r.signal[bld._id].push(smoking)
	if (connect) r.signal[bld._id].push(connect)
	if (low) r.signal[bld._id].push(low)
	if (deltaMdl) r.signal[bld._id].push(deltaMdl)

	if (extralrmS) r.signal[bld._id].push(...Object.values(extralrmS))
	if (alrStop) r.signal[bld._id].push(alrStop)
	if (supply) r.signal[bld._id].push(supply)
	r.signal[bld._id].sort((a, b) => new Date(a.date) - new Date(b.date))
}

// Счетчик аварий на карточке склада (стр. Склады)
function count(r, total, building) {
	// По складу
	for (const bId in r.signal) {
		// По всем аварийным сообщениям
		r.count[bId] ??= 0
		r?.signal?.[bId]?.forEach((o) => {
			if (o.count) r.count[bId] += 1
		})
	}
}

// Критические аварии (всплывающие окна)
function banner(r, bld, sect, am) {
	// Управление переведено на переключатели на щите
	r.banner.local ??= {}
	r.banner.local[bld._id] ??= {}
	r.banner.local[bld._id][sect._id] = store.alarm?.extralrm?.[bld._id]?.[sect._id]?.local ?? null
}
function bannerB(r, bld) {
	// Управление переведено на переключатели на щите
	r.banner.local ??= {}
	r.banner.local[bld._id] ??= {}
	r.banner.local[bld._id][bld._id] = store.alarm?.extralrm?.[bld._id]?.local ?? null
	// Обратитесь в сервисный центр (пропала связь с модулем)
	r.banner.connect ??= {}
	const isErrM = !!Object.keys(store.alarm?.module?.[bld._id] ?? {}).length
	r.banner.connect[bld._id] = isErrM ? mes[28] : null
	// Окуривание
	r.banner.smoking ??= {}
	r.banner.smoking[bld._id] ??= {}
	r.banner.smoking[bld._id] = store.alarm?.extra?.[bld._id]?.smoking ?? null
}

module.exports = { barB, bar, bannerB, banner, signalB, signal, count }
