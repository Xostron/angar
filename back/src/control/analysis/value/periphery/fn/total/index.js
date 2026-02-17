const calc = require('@tool/command/abs_humidity')
const dewpoint = require('@tool/sensor/dewpoint')
const { fnMsg, fnMsgs } = require('@tool/sensor/fn')
const { state, fnState, toutVsWeather } = require('@tool/sensor/total')

// Значения датчиков для расчетов алгоритма и отображения на панели с погодой
module.exports = function total(equip, result, retain) {
	const { sensor, section, building, cooler, weather } = equip

	const idsB = building.map((el) => el._id)
	// Температура улицы (мин) среди всех складов данной pc
	let flt = (el) =>
		idsB.includes(el.owner.id) && el.type === 'tout' && result?.[el._id]?.state === 'on'
	let fltA = (el) => idsB.includes(el.owner.id) && el.type === 'tout'
	const tout = state(sensor, result, flt, fltA)

	// Влажность улицы (макс) среди всех складов данной pc
	flt = (el) =>
		idsB.includes(el.owner.id) && el.type === 'hout' && result?.[el._id]?.state === 'on'
	fltA = (el) => idsB.includes(el.owner.id) && el.type === 'hout'
	const hout = state(sensor, result, flt, fltA)

	// Аварийные сообщения для обычного склада
	fnMsgs(building, tout, 'tout', 'normal')
	fnMsgs(building, hout, 'hout', 'normal')

	result.total = {
		// Температура улицы (мин) среди всех складов данной pc
		tout,
		// Влажность улицы (макс) среди всех складов данной pc
		hout,
	}

	// Абсолютная влажность
	result.humAbs = {
		// внешняя
		out: {
			com: calc(tout?.min, hout?.max, 'Внешняя абс влажность'),
			// [bld._id] от погоды
		},
		// продукт
		in: {
			// [bld._id]
		},
	}

	// По складу
	for (const bld of building) {
		let idsS = []
		let idsAll = []
		// let ids = []
		if (bld.type !== 'cold') {
			// Найти секции которые в авто
			idsS = section
				.filter((el) => el.buildingId === bld._id && retain?.[bld?._id]?.mode?.[el?._id])
				.map((el) => el._id)
			// Все секции
			idsAll = section.filter((el) => el.buildingId === bld._id).map((el) => el._id)
		} else {
			idsS = section.filter((el) => el.buildingId === bld._id).map((el) => el._id)
			idsAll = section.filter((el) => el.buildingId === bld._id).map((el) => el._id)
		}
		const ids = idsS.length ? idsS : idsAll

		// Температура продукта (макс) по всем секциям склада
		// если секция не в авто режиме, то абсолютная влажность продукта = null
		flt = (el) =>
			ids.includes(el.owner.id) && el.type === 'tprd' && result?.[el._id]?.state === 'on'
		fltA = (el) => ids.includes(el.owner.id) && el.type === 'tprd'
		const tprd = state(sensor, result, flt, fltA)
		// Темп. канала (мин) по всем секциям
		flt = (el) =>
			ids.includes(el.owner.id) && el.type === 'tcnl' && result?.[el._id]?.state === 'on'
		fltA = (el) => ids.includes(el.owner.id) && el.type === 'tcnl'
		const tcnl = state(sensor, result, flt, fltA)
		// CO2 по всем секциям
		flt = (el) =>
			ids.includes(el.owner.id) && el.type === 'co2' && result?.[el._id]?.state === 'on'
		fltA = (el) => ids.includes(el.owner.id) && el.type === 'co2'
		const co2 = state(sensor, result, flt, fltA)
		// Температура потолка (Температура помещения)
		const tin = fnState(sensor, result, bld._id, 'tin')
		// Аварийные сообщения для склада холодильник
		fnMsg(bld, tin, 'tin', 'cold')

		// Влажность продукта (макс) - поиск по рабочим датчикам
		flt = (el) =>
			el.owner.id === bld._id && el.type === 'hin' && result?.[el._id]?.state === 'on'
		fltA = (el) => el.owner.id === bld._id && el.type === 'hin'
		const hin = state(sensor, result, flt, fltA)
		// 1. Выведены из работы
		if (hin.max === null && hin.state === 'off') (hin.max = 85), (hin.min = 85)
		// 2. Датчик в аварии - остается аварийным
		// Когда склад с одним агрегатом (датччики давления могут быть привязаны к складу)
		// Давление всасывания
		// const pin = fnState(sensor, result, bld._id, 'pin')
		// Давление нагнетания
		// const pout = fnState(sensor, result, bld._id, 'pout')

		// Для логирования
		// Температура продукта
		flt = (el) =>
			ids.includes(el.owner.id) && el.type === 'tprd' && result?.[el._id]?.state === 'on'
		fltA = (el) => ids.includes(el.owner.id) && el.type === 'tprd'
		const tprdL = state(sensor, result, flt, fltA)

		// Прогноз погоды (температура улицы)
		const tweather = result[bld._id].tweather
		// Прогноз погоды (влажность улицы)
		const hweather = result[bld._id].hweather
		// Температура улицы склада
		const tout = { ...result?.total?.tout } ?? {}
		tout.min = toutVsWeather(tout.min, tweather)
		// Абс влажность улицы
		result.humAbs.out[bld._id] = calc(
			tout?.min,
			result.total?.hout?.max,
			`${bld.name}:Абс.влажность улицы`
		)
		// const hout =

		// Результат (данные с датчиков для алгоритма)
		result.total[bld._id] = { tin, tprd, hin, tprdL, tcnl, tweather, hweather, tout, co2 }
		// Абсолютная влажность продукта
		result.humAbs.in[bld._id] = calc(
			result.total[bld._id].tprd.min,
			result.total[bld._id].hin.max,
			`${bld.name}:Абс.влажность продукта`
		)
		// Точка росы
		result.total[bld._id].point = dewpoint(
			result.total?.[bld._id]?.tout?.min,
			result?.total?.hout?.max
		)
	}

	//  По секциям
	for (const sec of section) {
		// Температура продукта
		const tprd = fnState(sensor, result, sec._id, 'tprd')
		// Температура канала
		const tcnl = fnState(sensor, result, sec._id, 'tcnl')
		// Давление
		const p = fnState(sensor, result, sec._id, 'p')
		// Датчик СО2
		const co2 = fnState(sensor, result, sec._id, 'co2')

		// Датчики группы 1испаритель+1агрегат
		// Температура всасывания
		const clr = cooler.reduce((acc, el) => {
			if (el.sectionId != sec._id) return acc
			acc[el._id] = {
				tmpCooler: fnState(sensor, result, el._id, 'cooler'),
				pin: fnState(sensor, result, el._id, 'pin'),
				pout: fnState(sensor, result, el._id, 'pout'),
			}
			return acc
		}, {})
		result.total[sec._id] = { tprd, tcnl, p, co2, cooler: clr }
	}
}
