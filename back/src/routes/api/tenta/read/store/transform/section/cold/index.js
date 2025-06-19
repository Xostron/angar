const { get } = require('@tool/get/sensor')
const { readOne } = require('@tool/json')

// Данные для холодильника
async function cold(result, idS, idB, obj) {
	const { data, sensor } = obj
	const value = result.value

	const p = [
		readOne('aggregate'), // Считываем агрегатов
		readOne('cooler'), // Считываем испарители
	]
	const [aggregate, cooler] = await Promise.all(p)

	// дт. состояния СО2
	value[idS + 'co2'] = data?.total?.[idS]?.device?.co2
	// дт. состояния увлажнение
	value[idS + 'wetting'] = data?.total?.[idS]?.device?.wetting
	// дт. состояния Озонатора
	value[idS + 'ozon'] = data?.total?.[idS]?.device?.ozon

	// Температура продукта
	get('tprd', idS, 'section', sensor).forEach((el) => fe(el, result.value, data))
	// СО2 датчик
	get('co2', idS, 'section', sensor).forEach((el) => fe(el, result.value, data))
	// Агрегаты
	aggregate?.filter((el) => el?.buildingId === idB)?.forEach((el) => (result.value[el._id] = data[el?._id]?.state))
	// Конденсаторы + вентиляторы
	aggregate
		.map((el) => el.condenser)
		.flat()
		.forEach((el) => (result.value[el._id] = data?.[el?.aggregateListId]?.condenser?.[el._id]))

	// Испарители
	cooler
		?.filter((el) => el?.sectionId === idS)
		?.forEach((el) => {
			result.value[el._id] = { state: data[el?._id]?.state, mode: data[el?._id]?.name }
			get('cooler', el._id, 'cooler', sensor).forEach((e) => fe(e, result.value, data))
			get('pin', el._id, 'cooler', sensor).forEach((e) => fe(e, result.value, data))
			get('pout', el._id, 'cooler', sensor).forEach((e) => fe(e, result.value, data))
		})

	return
}

module.exports = cold

function fe(el, o, data) {
	o[el._id] = {
		value: data?.[el._id]?.state === 'on' ? data?.[el._id]?.value : undefined,
		state: data?.[el._id]?.state,
	}
}
