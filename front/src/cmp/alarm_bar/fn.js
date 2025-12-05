// Возвращает аварии определенной секции
function fnAlarm(buildingId, sectionId, bar, timer) {
	// Аварии секции авторежима
	const tout = bar?.[buildingId]?.[sectionId]?.tout?.[0]
	const hout = bar?.[buildingId]?.[sectionId]?.hout?.[0]
	const antibz = bar?.[buildingId]?.[sectionId]?.antibliz
	const overVlv = bar?.[buildingId]?.[sectionId]?.overVlv
	const alrClosed = bar?.[buildingId]?.[sectionId]?.alrClosed
	const co2work = bar?.[buildingId]?.[sectionId]?.co2work
	const co2wait = bar?.[buildingId]?.[sectionId]?.co2wait
	const openVin = bar?.[buildingId]?.[sectionId]?.openVin
	const ventWait = bar?.[buildingId]?.[sectionId]?.ventWait
	const ventWork = bar?.[buildingId]?.[sectionId]?.ventWork
	const durVentWork = bar?.[buildingId]?.[sectionId]?.durVentWork
	const ventOn = bar?.[buildingId]?.[sectionId]?.ventOn
	const debdo = bar?.[buildingId]?.[sectionId]?.debdo
	const stableVno = bar?.[buildingId]?.[sectionId]?.stableVno
	const alr = [
		alrClosed,
		tout,
		hout,
		antibz,
		co2work,
		co2wait,
		openVin,
		debdo,
		stableVno,
		overVlv,
		ventWait,
		ventWork,
		durVentWork,
		ventOn,
	].filter((el) => el)
	// Таймеры запретов
	const tmr = timer?.[buildingId] ? Object.values(timer[buildingId]) : []
	return { alr, tmr }
}

// Возвращает аварии суммарно по всем секциям
function fnAlarmB(buildingId, barB, timer) {
	const tout = barB?.[buildingId]?.tout?.[0]
	const hout = barB?.[buildingId]?.hout?.[0]
	const antibz = barB?.[buildingId]?.antibliz?.[0]
	const overVlv = barB?.[buildingId]?.overVlv?.[0]
	const alrClosed = barB?.[buildingId]?.alrClosed?.[0]
	const co2work = barB?.[buildingId]?.co2work?.[0]
	const co2wait = barB?.[buildingId]?.co2wait?.[0]
	const openVin = barB?.[buildingId]?.openVin?.[0]
	const debdo = barB?.[buildingId]?.debdo?.[0]
	const stableVno = barB?.[buildingId]?.stableVno?.[0]
	const ventWait = barB?.[buildingId]?.ventWait?.[0]
	const ventWork = barB?.[buildingId]?.ventWork?.[0]
	const durVentWork = barB?.[buildingId]?.durVentWork?.[0]
	const ventOn = barB?.[buildingId]?.ventOn?.[0]
	const alr = [
		alrClosed,
		tout,
		hout,
		antibz,
		co2work,
		co2wait,
		openVin,
		debdo,
		stableVno,
		overVlv,
		ventWait,
		ventWork,
		durVentWork,
		ventOn,
	].filter((el) => el)
	const tmr = timer?.[buildingId] ? Object.values(timer[buildingId]) : []

	return { alr, tmr }
}

export { fnAlarm, fnAlarmB }
