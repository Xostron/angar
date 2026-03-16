const calc = require('@tool/command/abs_humidity')
const dewpoint = require('@tool/sensor/dewpoint')
const { fnMsg, fnMsgs } = require('@tool/sensor/fn')
const { state, fnState, toutVsWeather } = require('@tool/sensor/total')


/**
 * Датчики улицы (темп, влажность, расч абс влажность, погода)
 * являются общими для складов находящихся на одном Pos-терминале
 * 
 * @param {*} equip 
 * @param {*} result 
 * @param {*} idsB 
 */
function sensPos(equip, result, idsB) {
	const { sensor, building } = equip

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

	// idsB.forEach((idB) => console.log(66, result[idB].tweather))

	// console.log(666, result.total.tout, result.total result.humAbs.out)
}

module.exports = sensPos