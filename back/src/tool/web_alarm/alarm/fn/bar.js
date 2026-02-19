const { data: store } = require('@store')
const mes = require('@dict/message')

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
		JSON.stringify(Object.values(store.alarm.extralrm?.[bld._id]?.debdo ?? {})?.[0] ?? null),
	)
	if (debdo) debdo.msg = mes[102].msg

	const secAuto = store?.retain?.[bld._id]?.mode?.[sect._id]
	// Если секция в авто, смотрим есть ли у нее аварии долгого закрытия по клапану
	const long = secAuto ? (store.alarm.extralrm?.[bld._id]?.[sect._id]?.alrValve ?? null) : null

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

module.exports = { bar, barB }
