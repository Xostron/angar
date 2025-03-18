const { fnDetection, fnMsg, fnMsgs } = require('@tool/sensor/fn')
const vSensor = require('@tool/sensor')
const { getS, getSA } = require('@tool/get/sensor')
const calc = require('@tool/command/abs_humidity')
const dewpoint = require('@tool/sensor/dewpoint')

/**
 * Аналоговые датчики
 * Преобразование с учетом точности и коррекции
 * @param {*} equip данные json по оборудованию
 * @param {*} val данные опроса модулей
 * @param {*} retain сохраненные данные склада (настройки и т.д.)
 * @param {*} result результат (отображение)
 *
 */
function sensor(equip, val, retain, result) {
	// Анализ датчика (result[s._id] - датчики отображаются на экране настроек датчиков,
	// result.total - значения датчиков для расчетов алгоритма и отображения на мнемосхемах )
	vSensor(equip, val, retain, result)
	// Проверка по секционно датчиков температуры продукта
	fnDetection(equip, result, retain)
	// Готовые результаты по датчикам
	total(equip, result, retain)
}

module.exports = sensor

// Значения датчиков для расчетов алгоритма и отображения на панели с погодой
function total(equip, result, retain) {
	const { sensor, section, building, cooler, weather } = equip

	const idsB = building.map((el) => el._id)
	// Температура улицы (мин) среди всех складов данной pc
	let flt = (el) => idsB.includes(el.owner.id) && el.type === 'tout' && result?.[el._id]?.state === 'on'
	let fltA = (el) => idsB.includes(el.owner.id) && el.type === 'tout'
	const tout = state(sensor, result, flt, fltA)

	// Влажность улицы (макс) среди всех складов данной pc
	flt = (el) => idsB.includes(el.owner.id) && el.type === 'hout' && result?.[el._id]?.state === 'on'
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
		if (bld.type === 'normal') {
			// Найти секции которые в авто
			idsS = section.filter((el) => el.buildingId === bld._id && retain?.[bld?._id]?.mode?.[el?._id]).map((el) => el._id)
			// Все секции
			idsAll = section.filter((el) => el.buildingId === bld._id).map((el) => el._id)
		} else idsS = section.filter((el) => el.buildingId === bld._id).map((el) => el._id)

		// Температура продукта (макс) по всем секциям склада
        // если секция не в авто режиме, то абсолютная влажность продукта = null
		flt = (el) => idsAll.includes(el.owner.id) && el.type === 'tprd' && result?.[el._id]?.state === 'on'
		fltA = (el) => idsAll.includes(el.owner.id) && el.type === 'tprd'
		const tprd = state(sensor, result, flt, fltA)

		// Темп. канала (мин) по всем секциям
		flt = (el) => idsAll.includes(el.owner.id) && el.type === 'tcnl' && result?.[el._id]?.state === 'on'
		fltA = (el) => idsAll.includes(el.owner.id) && el.type === 'tcnl'
		const tcnl = state(sensor, result, flt, fltA)

		// Температура потолка (Температура помещения)
		const tin = fnState(sensor, result, bld._id, 'tin')
		// Аварийные сообщения для склада холодильник
		fnMsg(bld, tin, 'tin', 'cold')

		// Влажность продукта (макс)
		flt = (el) => el.owner.id === bld._id && el.type === 'hin' && result?.[el._id]?.state !== 'alarm'
		fltA = (el) => el.owner.id === bld._id && el.type === 'hin'
		const hin = state(sensor, result, flt, fltA)
		// Давление всасывания
		const pin = fnState(sensor, result, bld._id, 'pin')
		// Давление нагнетания
		const pout = fnState(sensor, result, bld._id, 'pout')
		// Температура всасывания
		// const tina = fnState(sensor, result, bld._id, 'cooler')

		// Для логирования
		// Температура продукта
		flt = (el) => idsAll.includes(el.owner.id) && el.type === 'tprd' && result?.[el._id]?.state === 'on'
		fltA = (el) => idsAll.includes(el.owner.id) && el.type === 'tprd'
		const tprdL = state(sensor, result, flt, fltA)

		// Прогноз погоды (температура улицы)
		const tweather = result[bld._id].tweather
		// Прогноз погоды (влажность улицы)
		const hweather = result[bld._id].hweather
		// Температура улицы склада
		const tout = { ...result?.total?.tout } ?? {}
		tout.min = toutVsWeather(tout.min, tweather)
		// Абс влажность улицы
		result.humAbs.out[bld._id] = calc(tout?.min, result.total?.hout?.max, `${bld.name}:Абс.влажность улицы`)
		// const hout =

		// Результат (данные с датчиков для алгоритма)
		result.total[bld._id] = { tin, tprd, hin, pin, pout, tprdL, tcnl, tweather, hweather, tout }
		// Абсолютная влажность продукта
		result.humAbs.in[bld._id] = calc(result.total[bld._id].tprd.max, result.total[bld._id].hin.max, `${bld.name}:Абс.влажность продукта`)
		// Точка росы
		result.total[bld._id].point = dewpoint(result.total?.[bld._id]?.tout?.min, result?.total?.hout?.max)
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

		// Температура всасывания
		const idClr = cooler.find((el) => el.sectionId === sec._id)?._id
		const clr = fnState(sensor, result, idClr, 'cooler')

		result.total[sec._id] = { tprd, tcnl, p, co2, cooler: clr }
	}

	// console.log(8888, result.total, result.humAbs)
}

// мин, макс, состояние по датчикам
function state(sensor, result, flt, fltA) {
	// Значения группы датчиков
	let values = getS(sensor, result, flt)

	let on = getSA(sensor, result, fltA).some((el) => el === 'on')
	let off = getSA(sensor, result, fltA).some((el) => el === 'off')

	const stt = off ? 'off' : 'alarm'
	const st = on ? 'on' : stt

	// Нет аварий
	if (values?.length) return { state: st, max: Math.max(...values), min: Math.min(...values) }
	return { state: stt, max: null, min: null }
}

function fnState(sensor, result, idB, type) {
	const flt = (el) => el.owner.id === idB && el.type === type && result?.[el._id]?.state === 'on'
	const fltA = (el) => el.owner.id === idB && el.type === type
	return state(sensor, result, flt, fltA)
}

/**
 * Замена датчика улицы на прогноз погоды
 * @param {number} tout min температура улицы по датчику
 * @param {object} tw температура улицы по прогнозу
 * @returns {number} температура улицы min
 */
function toutVsWeather(tout, tw) {
	// Прогноз погоды выкл или не валиден
	if (tw.state != 'on') return tout
	// Условие переключения температуры на прогноз погоды если датчик рабочий
	if (tout !== null && tout > 0 && tout > tw.value && tw.value < 1) return tw.value
	// Если датчик температуры не рабочий
	if (tout === null || tout === undefined) return tw.value
	// по-умолчанию: работа по датчику
	return tout
}
