const { data: store } = require('@store')
const mes = require('@dict/message')
const { isErrMs } = require('@tool/message/plc_module')

// Аварии на боковой колонке на странице "внутренности" Секции
function bar(r, bld, sect, am, start) {
	// склад выключен, авторежим не выбран - очищаем аварии, сообщения, таймеры запретов авторежима
	// console.log(1100, store.alarm?.extra?.[bld._id])
	if (!am) {
		r.bar ??= {}
		r.bar[bld._id] = {}
		return
	}
	// Боковая панель аварий для секции
	// const d = store.alarm.auto?.[bld._id]?.[am]?.[sect._id]
	const smoking1 = store.alarm?.extra?.[bld._id]?.smoking1
	const smoking2 = store.alarm?.extra?.[bld._id]?.smoking2
	const ozon1 = store.alarm?.extra?.[bld._id]?.ozon1
	const ozon2 = store.alarm?.extra?.[bld._id]?.ozon2
	const alrClosed = store.alarm?.extralrm?.[bld._id]?.[sect._id]?.alrClosed ?? null
	const alrClosedB = store.alarm?.extralrm?.[bld._id]?.alrClosed ?? null
	const antibliz = store.alarm.extralrm[bld._id]?.[sect._id]?.antibliz ?? null
	const overVlv = store.alarm.extralrm[bld._id]?.[sect._id]?.overVlv ?? null
	const tout1 = store.alarm.auto?.[bld._id]?.[am]?.tout1 ?? null
	const tout2 = store.alarm.auto?.[bld._id]?.[am]?.tout2 ?? null
	const tout3 = store.alarm.auto?.[bld._id]?.[am]?.tout3 ?? null
	const hout1 = store.alarm.auto?.[bld._id]?.[am]?.hout1 ?? null
	const hout2 = store.alarm.auto?.[bld._id]?.[am]?.hout2 ?? null
	const ahout1 = store.alarm.auto?.[bld._id]?.[am]?.ahout1 ?? null
	const ahout2 = store.alarm.auto?.[bld._id]?.[am]?.ahout2 ?? null
	const co2work = store.alarm.extra?.[bld._id]?.co2?.work ?? null
	const co2wait = store.alarm.extra?.[bld._id]?.co2?.wait ?? null
	// const co2on = store.alarm.extra?.[bld._id]?.co2?.on ?? null
	const openVin = store.alarm.extralrm?.[bld._id]?.openVin ?? null
	const ventWait = store.alarm.extra?.[bld._id]?.vent?.wait ?? null
	const ventWork = store.alarm.extra?.[bld._id]?.vent?.work ?? null
	const durVentWork = store.alarm.extra?.[bld._id]?.durVent?.work ?? null
	const ventOn = store.alarm.extra?.[bld._id]?.vent?.ventOn ?? null
	const stableVno = store.alarm.extralrm?.[bld._id]?.[sect._id]?.stableVno ?? null
	const debdo = JSON.parse(
		JSON.stringify(Object.values(store.alarm.extralrm?.[bld._id]?.debdo ?? {})?.[0] ?? null)
	)
	if (debdo) debdo.msg = mes[102].msg

	const secAuto = store?.retain?.[bld._id]?.mode?.[sect._id]
	// Если секция в авто, смотрим есть ли у нее аварии долгого закрытия по клапану
	const long = secAuto ? store.alarm.extralrm?.[bld._id]?.[sect._id]?.alrValve ?? null : null

	r.bar[bld._id] ??= {}
	r.bar[bld._id][sect._id] ??= {}
	r.bar[bld._id][sect._id].tout ??= []
	r.bar[bld._id][sect._id].hout ??= []

	r.bar[bld._id][sect._id].alrClosed = alrClosed || alrClosedB
	r.bar[bld._id][sect._id].antibliz = antibliz
	r.bar[bld._id][sect._id].overVlv = overVlv
	r.bar[bld._id][sect._id].co2work = co2work
	r.bar[bld._id][sect._id].co2wait = co2wait
	r.bar[bld._id][sect._id].openVin = openVin
	r.bar[bld._id][sect._id].ventWait = ventWait
	r.bar[bld._id][sect._id].ventWork = ventWork
	r.bar[bld._id][sect._id].ventOn = ventOn
	r.bar[bld._id][sect._id].durVentWork = durVentWork
	r.bar[bld._id][sect._id].stableVno = stableVno
	r.bar[bld._id][sect._id].debdo = debdo
	r.bar[bld._id][sect._id].smoking1 = smoking1
	r.bar[bld._id][sect._id].smoking2 = smoking2
	r.bar[bld._id][sect._id].ozon1 = ozon1
	r.bar[bld._id][sect._id].ozon2 = ozon2
	r.bar[bld._id][sect._id].long = long

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
		r.barB[bld._id].overVlv ??= []
		r.barB[bld._id].alrClosed ??= []
		r.barB[bld._id].co2work ??= []
		r.barB[bld._id].co2wait ??= []
		r.barB[bld._id].openVin ??= []
		r.barB[bld._id].ventWait ??= []
		r.barB[bld._id].ventWork ??= []
		r.barB[bld._id].durVentWork ??= []
		r.barB[bld._id].ventOn ??= []
		r.barB[bld._id].stableVno ??= []
		r.barB[bld._id].debdo ??= []
		r.barB[bld._id].smoking1 ??= []
		r.barB[bld._id].smoking2 ??= []
		r.barB[bld._id].ozon1 ??= []
		r.barB[bld._id].ozon2 ??= []
		r.barB[bld._id].long ??= []

		if (s.tout) r.barB[bld._id].tout.push(...s.tout)
		if (s.hout) r.barB[bld._id].hout.push(...s.hout)
		if (s.antibliz) r.barB[bld._id].antibliz.push(s.antibliz)
		if (s.overVlv) r.barB[bld._id].overVlv.push(s.overVlv)
		if (s.alrClosed) r.barB[bld._id].alrClosed.push(s.alrClosed)
		if (s.co2work) r.barB[bld._id].co2work.push(s.co2work)
		if (s.co2wait) r.barB[bld._id].co2wait.push(s.co2wait)
		// if (s.co2on) r.barB[bld._id].co2on.push(s.co2on)
		if (s.openVin) r.barB[bld._id].openVin.push(s.openVin)
		if (s.ventWait) r.barB[bld._id].ventWait.push(s.ventWait)
		if (s.ventWork) r.barB[bld._id].ventWork.push(s.ventWork)
		if (s.durVentWork) r.barB[bld._id].durVentWork.push(s.durVentWork)
		if (s.ventOn) r.barB[bld._id].ventOn.push(s.ventOn)
		if (s.stableVno) r.barB[bld._id].stableVno.push(s.stableVno)
		if (s.debdo) r.barB[bld._id].debdo.push(s.debdo)
		if (s.smoking1) r.barB[bld._id].smoking1.push(s.smoking1)
		if (s.smoking2) r.barB[bld._id].smoking2.push(s.smoking2)
		if (s.ozon1) r.barB[bld._id].ozon1.push(s.ozon1)
		if (s.ozon2) r.barB[bld._id].ozon2.push(s.ozon2)
		if (s.long) r.barB[bld._id].long.push(s.long)
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
	// if (extralrm) r.signal[bld._id].push(...Object.values(extralrm))
	if (extralrm)
		Object.values(extralrm).forEach((el) =>
			el.code ? r.signal[bld._id].push(el) : r.signal[bld._id].push(...Object.values(el))
		)
	if (extra)
		Object.values(extra).forEach((el) =>
			el.code ? r.signal[bld._id].push(el) : r.signal[bld._id].push(...Object.values(el))
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
	const local = store.alarm?.extralrm?.[bld._id]?.local ?? null
	const alrClosed = store.alarm?.extralrm?.[bld._id]?.alrClosed ?? null
	const alrStop = store.alarm?.extralrm?.[bld._id]?.alarm ?? null
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
	r.signal[bld._id].sort((a, b) => {
		const [d1, m1, o1] = a.date.split('.')
		const aa = [m1, d1, o1].join('.')
		const [d2, m2, o2] = b.date.split('.')
		const bb = [m2, d2, o2].join('.')
		return new Date(aa) - new Date(bb)
	})
}

// Счетчик аварий на карточке склада (стр. Склады)
function count(r) {
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
	// Авария питания
	r.banner.supply ??= {}
	r.banner.supply[bld._id] ??= {}
	r.banner.supply[bld._id][sect._id] =
		store.alarm?.extralrm?.[bld._id]?.[sect._id]?.supply ?? null
}
function bannerB(r, bld) {
	// Управление переведено на переключатели на щите
	r.banner.local ??= {}
	r.banner.local[bld._id] ??= {}
	r.banner.local[bld._id][bld._id] = store.alarm?.extralrm?.[bld._id]?.local ?? null
	// Обратитесь в сервисный центр (пропала связь с модулем)
	r.banner.connect ??= {}
	r.banner.connect[bld._id] = isErrMs(bld._id) ? mes[28] : null
	// Склад не работает: требуется калибровка клапанов
	r.banner.notTune ??= {}
	r.banner.notTune[bld._id] = store.alarm?.extralrm?.[bld._id]?.notTune
	// Авария питания. Ручной сброс
	r.banner.battery ??= {}
	r.banner.battery[bld._id] = store.alarm?.extralrm?.[bld._id]?.battery
	// Авария питания
	r.banner.supply ??= {}
	r.banner.supply[bld._id] ??= {}
	r.banner.supply[bld._id][bld._id] = store.alarm?.extralrm?.[bld._id]?.supply ?? null
}

module.exports = { barB, bar, bannerB, banner, signalB, signal, count }
