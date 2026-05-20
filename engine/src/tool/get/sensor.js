/**
 * для авто
 * Собираются датчики конкретной секции и возврщается
 * значение датчика с наименьшим значением
 * @param {*} value
 * @param {*} sensors
 * @param {*} ownerId
 * @param {*} type	тип датчика (p: давление, tin:темп потолка,
 * 					tout: темп улицы, tcnl:темп канала, tprd: темп продукта,
 * 					hin:влажность продукта, hout:влажность улицы)
 * @param {*} max true - результат максимальное значение, false - минимальное
 * @return
 */

function getSensor(value, sensors, ownerId, type, max = false) {
	const sens = sensors
		.filter((el) => el.type === type && el.owner.id === ownerId && value?.[el._id]?.on !== false)
		.map((el) => value?.[el._id]?.value)
	const idx = max ? arr.length - 1 : 0
	return sens.sort((a, b) => a - b)[idx] ?? null
}

/**
 * для авто
 * Собираются датчики по всем секциям одного склада (секции в авто),
 * и возвращается значение датичка с наибольшим значением
 * @param {*} obj
 * @param {*} ownerId
 * @param {*} type
 */
function getSensBuild(obj, idB, type) {
	const { value, data, retain } = obj
	const sect = data.section.filter((el) => el.buildingId === idB).map((o) => o._id)
	return (
		data.sensor
			.filter((el) => el?.type === type && sect.includes(el?.owner?.id) && value?.[el._id]?.on !== false)
			.map((o) => value?.[o._id]?.value)
			.sort((a, b) => b - a)[0] ?? null
	)
}

// Получить массив датчиков секции
function getListSens(sectionId, sensor, value, type) {
	let sens = sensor.filter((s) => s.owner.id == sectionId && s.type == type)
	sens = sens
		.map((s) => ({ ...s, value: value?.[s._id]?.value }))
		.filter((s) => s.value != null)
		.sort((a, b) => a?.value - b?.value)
	return sens
}

/**
 * Список датчиков по родителю и его типу
 * @param {String} code Тип датчика
 * @param {String} id ссылка на родителя
 * @param {String} type Тип родителя
 * @returns {Array} Список датчиков удовлетворяющих запросу
 */
function get(code, id, type, sensor) {
	if (!id || !type || !sensor) return
	if (!code)
		return sensor.filter((el) => {
			return el.owner.id == id && el.owner.type == type
		})
	return sensor.filter((el) => {
		return el.owner.id == id && el.owner.type == type && el.type == code
	})
}

/**
 * 
 * @param {*} arr массив датчиков
 * @param {*} data объект значений датчиков
 * @param {*} flt фильтр
 * @returns
 */
function getS(arr, data, flt) {
	return arr
		.filter((el) => flt(el))
		.map((el) => data[el._id].value)
		.filter((el) => el !== null)
}

function getSA(arr, data, flt) {
	return arr
		.filter((el) => flt(el))
		.map((el) => data?.[el._id]?.state)
}

function checkS(state1, state2) {
	if ([state1, state2].includes('off')) return 'off'
	if ([state1, state2].includes('alarm')) return 'alarm'
	return 'on'
}


module.exports = { getSensor, getSensBuild, getListSens, get, getS, getSA,checkS }
