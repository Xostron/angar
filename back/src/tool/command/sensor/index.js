/**
 * Показания датчиков секции для расчетов авторежимов
 * @param {string} idB id склада
 * @param {string} idS id секции
 * @param {object} obj Глобальные данные
 * @returns 
 */
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
		tprd: value?.total?.[idB]?.tprd?.min,
		// Температура канала - мин
		tcnl: value?.total?.[idS]?.tcnl?.min,
		// Давление - макс
		p: value?.total?.[idS]?.p?.max,
		// Датчики по камере и испарителю
		cooler: coolerS(idB, idS, obj),
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
		// // Склад холодильник: Датчики по камере и испарителю
		// cooler: cooler(idB, obj),
		// Датчики по камере и испарителю
		// cooler: coolerB(idB, obj),
	}
	// console.log(333, 'склад', idB, 'абс вл. улицы', o.hAbsOut, 'абс влажность продукта', o.hAbsIn)
	return o
}

// Секция: Датчики по испарителю 
function coolerS(idB, idS, obj) {
	const { value, data } = obj
	const r = data.cooler.reduce((acc, clr) => {
		if (clr.sectionId != idS) return acc
		acc[clr._id] = {
			// Темп. всасывания
			tmpCooler: value?.total?.[idS]?.cooler?.[clr._id]?.tmpCooler?.max,
			// Давление агрегата
			pin: value?.total?.[idS]?.cooler?.[clr._id]?.pin?.max,
			pout: value?.total?.[idS]?.cooler?.[clr._id]?.pout?.max,
		}

		return acc
	}, {})
	// Температура продукта
	r.tprd = value?.total?.[idB]?.tprd?.min,
	// Датчик СО2
	r.co2 = value?.total?.[idS]?.co2?.max
	return r
}

module.exports = { sensor, sensorBuilding }
