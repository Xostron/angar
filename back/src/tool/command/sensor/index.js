// Показания датчиков секции для расчетов авторежимов
function sensor(idB, idS, obj) {
	const { value, data } = obj
	// Показания с датчиков
	const o = {
		// Температура улицы - min
		tout: value?.total?.[idB]?.tout?.min,
		// Влажность улицы - max
		hout: value?.total?.hout?.min,
		// Абс влажность улицы
		hAbsOut: isNaN(+value?.humAbs?.out?.com) ? +value?.humAbs?.out?.[idB] : +value?.humAbs?.out?.com,
		// Температура потолка
		tin: value?.total?.[idB]?.tin?.min,
		// Влажность продукта - max
		hin: value?.total?.[idB]?.hin?.min,
		// Абсолютная влажность проукта
		hAbsIn: isNaN(+value?.humAbs?.in?.[idB]) ? null : +value?.humAbs?.in?.[idB],
		// Минимальная температура продукта по секции
		tprd: value?.total?.[idS]?.tprd?.min,
		// Температура канала - мин
		tcnl: value?.total?.[idS]?.tcnl?.min,
		// Давление - макс
		p: value?.total?.[idS]?.p?.max,
	}

	return o
}

// Показания датчиков склада для расчетов авторежимов
function sensorBuilding(idB, obj) {
	const { value, data } = obj
	const o = {
		// Погода: температура, влажность
		tw: value?.total?.tweather ?? null,
		hw: value?.total?.hweather ?? null,
		// Температура улицы - min
		tout: value?.total?.[idB]?.tout?.min,
		// Влажность улицы - max
		hout: value?.total?.hout?.max,
		// Абс влажность улицы
		// hAbsOut: isNaN(+value?.humAbs?.out?.com) ? +value?.humAbs?.out?.[idB] : +value?.humAbs?.out?.com,
		hAbsOut: value?.humAbs?.out?.com ?? value?.humAbs?.out?.[idB],
		// Температура потолка - min
		tin: value?.total?.[idB]?.tin?.min,
		// Влажность продукта - max
		hin: value?.total?.[idB]?.hin?.max,
		//  Абс. влажность продукта
		// hAbsIn: isNaN(+value?.humAbs?.in?.[idB]) ? null : +value?.humAbs?.in?.[idB],
		hAbsIn: value?.humAbs?.in?.[idB],
		// Максимальная температура продукта по складу (по всем секция в авто режиме)
		tprd: value?.total?.[idB]?.tprd?.min,
		tcnl: value?.total?.[idB]?.tcnl?.min,
		// Датчики по камере и испарителю
		cooler: cooler(idB, obj),
	}
	// console.log(333, 'склад', idB, 'абс вл. улицы', o.hAbsOut, 'абс влажность продукта', o.hAbsIn)
	return o
}

// Датчики по камере и испарителю для расчетов авторежимов
function cooler(idB, obj) {
	const { value, data } = obj
	const idS = data.section.find((el) => el.buildingId === idB)?._id
	return {
		// Температура продукта
		tprd: value?.total?.[idS]?.tprd?.min,
		// Датчик СО2
		co2: value?.total?.[idS]?.co2?.max,
		// Температура всасывания
		clr: value?.total?.[idS]?.cooler?.max,
	}
}

module.exports = { sensor, sensorBuilding }
