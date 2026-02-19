const { data: store } = require('@store')

// Аварии на странице "Сигналы" (собираем по секции)
function signal(r, bld, sect, am) {
	r.signal[bld._id] ??= []
	// Сообщения: авторежимы, доп. аварии, доп. функции
	// const auto = store.alarm.auto?.[bld._id]?.[am]
	const extralrm = store.alarm.extralrm?.[bld._id]?.[sect?._id]
	const extra = store.alarm?.extra?.[bld._id]?.[sect._id]
	// if (auto) r.signal[bld._id].push(...Object.values(auto))
	// if (extralrm) r.signal[bld._id].push(...Object.values(extralrm))
	if (extralrm)
		Object.values(extralrm).forEach((el) =>
			el.code ? r.signal[bld._id].push(el) : r.signal[bld._id].push(...Object.values(el)),
		)
	if (extra)
		Object.values(extra).forEach((el) =>
			el.code ? r.signal[bld._id].push(el) : r.signal[bld._id].push(...Object.values(el)),
		)
	// console.log(8800, r.signal[bld._id])
	// console.log(9900, extralrm)
}

// Аварии на странице "Сигналы" (собираем по складу и суммируем с секциями)
function signalB(r, bld, am, data) {
	r.signal[bld._id] ??= []
	// CO2 Склад холодильник
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
			.map((el) => doc._id + '_' + el._id)
			.forEach((e) => {
				const arr = Object.values(store.alarm?.extralrm?.[bld._id]?.[e] ?? [])
				if (arr.length) r.signal[bld._id].push(...arr)
			})
	})

	const auto = store.alarm.auto?.[bld._id]?.[am]
	const timer = Object.values(r.timer?.[bld._id] ?? {})
	const module = Object.values(store.alarm.module?.[bld._id] ?? {})
	const accel = Object.values(store.alarm.extra?.[bld._id]?.accel ?? {})
	const co2 = Object.values(store.alarm.extra?.[bld._id]?.co2 ?? {})
	const drain = Object.values(store.alarm.extra?.[bld._id]?.drain ?? {})
	const vent = Object.values(store.alarm.extra?.[bld._id]?.vent ?? {})
	const durVent = Object.values(store.alarm.extra?.[bld._id]?.durVent ?? {})
	const cable = store.alarm.extra?.[bld._id]?.cable ?? null
	const drainRun = store.alarm.extra?.[bld._id]?.drainRun ?? null
	const smoking1 = store.alarm.extra?.[bld._id]?.smoking1 ?? null
	const smoking2 = store.alarm.extra?.[bld._id]?.smoking2 ?? null
	const ozon1 = store.alarm.extra?.[bld._id]?.ozon1 ?? null
	const ozon2 = store.alarm.extra?.[bld._id]?.ozon2 ?? null
	const ozon3 = store.alarm.extra?.[bld._id]?.ozon3 ?? null
	const connect = store.alarm.extra?.[bld._id]?.connect ?? null
	const connectLost = store.alarm.extra?.[bld._id]?.connectLost ?? null
	// extralrm
	const wetting = store.alarm.extralrm?.[bld._id]?.wetting ?? null
	const gen = store.alarm.extralrm?.[bld._id]?.gen ?? null
	const vlvLim = store.alarm?.extralrm?.[bld._id]?.vlvLim ?? null
	const vlvCrash = store.alarm?.extralrm?.[bld._id]?.vlvCrash ?? null
	const hCoolerCrash = store.alarm?.extralrm?.[bld._id]?.hCoolerCrash ?? null
	const fCoolerCrash = store.alarm?.extralrm?.[bld._id]?.fCoolerCrash ?? null
	const local = store.alarm?.extralrm?.[bld._id]?.local ?? null
	const alrClosed = store.alarm?.extralrm?.[bld._id]?.alrClosed ?? null
	const alrStop = store.alarm?.extralrm?.[bld._id]?.alarm ?? null
	const bldOff = store.alarm?.extralrm?.[bld._id]?.bldOff ?? null
	const supply = store.alarm?.extralrm?.[bld._id]?.supply ?? null
	const low = store.alarm?.extralrm?.[bld._id]?.low ?? null
	const deltaMdl = store.alarm?.extralrm?.[bld._id]?.deltaMdl ?? null
	const openVin = store.alarm?.extralrm?.[bld._id]?.openVin ?? null
	const notTune = store.alarm?.extralrm?.[bld._id]?.notTune ?? null
	// аварии датчиков склада
	const extralrmS = store.alarm?.extralrm?.[bld._id]?.sensor
	const debdo = store.alarm?.extralrm?.[bld._id]?.debdo ?? null
	const battery = store.alarm?.extralrm?.[bld._id]?.battery ?? null

	if (auto) r.signal[bld._id].push(...Object.values(auto))
	if (timer?.length) r.signal[bld._id].push(...timer)
	if (module?.length) r.signal[bld._id].push(...module)
	if (accel) r.signal[bld._id].push(...accel)
	if (co2) r.signal[bld._id].push(...co2)
	if (drain) r.signal[bld._id].push(...drain)
	if (vent) r.signal[bld._id].push(...vent)
	if (durVent) r.signal[bld._id].push(...durVent)
	if (gen) r.signal[bld._id].push(gen)
	if (cable) r.signal[bld._id].push(cable)
	if (vlvLim) r.signal[bld._id].push(vlvLim)
	if (vlvCrash) r.signal[bld._id].push(...Object.values(vlvCrash))
	if (hCoolerCrash) r.signal[bld._id].push(...Object.values(hCoolerCrash))
	if (fCoolerCrash) r.signal[bld._id].push(...Object.values(fCoolerCrash))
	if (alrClosed) r.signal[bld._id].push(alrClosed)
	if (local) r.signal[bld._id].push(local)
	if (drainRun) r.signal[bld._id].push(drainRun)
	if (smoking1) r.signal[bld._id].push(smoking1)
	if (smoking2) r.signal[bld._id].push(smoking2)
	if (ozon1) r.signal[bld._id].push(ozon1)
	if (ozon2) r.signal[bld._id].push(ozon2)
	if (ozon3) r.signal[bld._id].push(ozon3)
	if (connect) r.signal[bld._id].push(connect)
	if (connectLost) r.signal[bld._id].push(connectLost)
	if (low) r.signal[bld._id].push(low)
	if (deltaMdl) r.signal[bld._id].push(deltaMdl)
	if (openVin) r.signal[bld._id].push(openVin)
	if (notTune) r.signal[bld._id].push(notTune)
	if (extralrmS) r.signal[bld._id].push(...Object.values(extralrmS))
	if (debdo) r.signal[bld._id].push(...Object.values(debdo))
	if (battery) r.signal[bld._id].push(battery)
	if (alrStop) r.signal[bld._id].push(alrStop)
	if (supply) r.signal[bld._id].push(supply)
	if (wetting) r.signal[bld._id].push(...Object.values(wetting ?? []))
	if (bldOff) r.signal[bld._id].push(bldOff)
	r.signal[bld._id].sort((a, b) => {
		const [d1, m1, o1] = a.date.split('.')
		const aa = [m1, d1, o1].join('.')
		const [d2, m2, o2] = b.date.split('.')
		const bb = [m2, d2, o2].join('.')
		return new Date(aa) - new Date(bb)
	})
}

module.exports = { signal, signalB }
