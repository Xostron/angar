// Возвращает аварии определенной секции
function fnAlarm(buildingId, sectionId, bar, timer) {
	// Аварии секции авторежима
	const tout = bar?.[buildingId]?.[sectionId]?.tout?.[0]
	const hout = bar?.[buildingId]?.[sectionId]?.hout?.[0]
	const antibz = bar?.[buildingId]?.[sectionId]?.antibliz
	const alrClosed = bar?.[buildingId]?.[sectionId]?.alrClosed
	const co2Normal = bar?.[buildingId]?.[sectionId]?.co2Normal
	const alr = [alrClosed, tout, hout, antibz, co2Normal].filter((el) => el)
	// Таймеры запретов
	const tmr = timer?.[buildingId] ? Object.values(timer[buildingId]) : []
	return { alr, tmr }
}

// Возвращает аварии суммарно по всем секциям
function fnAlarmB(buildingId, barB, timer) {
	const tout = barB?.[buildingId]?.tout?.[0]
	const hout = barB?.[buildingId]?.hout?.[0]
	const antibz = barB?.[buildingId]?.antibliz?.[0]
	const alrClosed = barB?.[buildingId]?.alrClosed?.[0]
	const co2Normal = barB?.[buildingId]?.co2Normal?.[0]
	const alr = [alrClosed, tout, hout, antibz, co2Normal].filter((el) => el)
	const tmr = timer?.[buildingId] ? Object.values(timer[buildingId]) : []

	return { alr, tmr }
}

export { fnAlarm, fnAlarmB }
