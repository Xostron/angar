// Показания датчиков секции
function sensor(idB, idS, obj) {
	const { value, data } = obj
	// Показания с датчиков
	const o = {
		// Температура улицы - min
		tout: value?.total?.tout?.min,
		// Влажность улицы - max
		hout: value?.total?.hout?.min,
		// Абс влажность улицы
		hAbsOut: +value?.humAbs?.out,
		// Температура потолка
		tin: value?.total?.[idB]?.tin?.min,
		// Влажность продукта - max
		hin: value?.total?.[idB]?.hin?.min,
		// Абсолютная влажность проукта
		hAbsIn: +value?.humAbs?.[idB],
		// Минимальная температура продукта по секции
		tprd: value?.total?.[idS]?.tprd?.min,
		// Температура канала - мин
		tcnl: value?.total?.[idS]?.tcnl?.min,
		// Давление - макс
		p: value?.total?.[idS]?.p?.max,
	}

	return o
}

// Показания датчиков склада
function sensorBuilding(idB, obj) {
	const { value, data } = obj

	const o = {
		// Температура улицы - min
		tout: value?.total?.tout?.min,
		// Влажность улицы - max
		hout: value?.total?.hout?.max,
		// Абс влажность улицы
		hAbsOut: +value?.humAbs?.out,
		// Температура потолка - min
		tin: value?.total?.[idB]?.tin?.min,
		// Влажность продукта - max
		hin: value?.total?.[idB]?.hin?.max,
		//  Абс. влажность продукта
		hAbsIn: +value?.humAbs?.[idB],
		// Максимальная температура продукта по складу (по всем секция в авто режиме)
		tprd: value?.total?.[idB]?.tprd?.min,
		// Датчики по камере и испарителю
		cooler: cooler(idB, obj),
	}
	// console.log(333, value.total, o)
	return o
}

// Датчики по камере и испарителю
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
