const section = require('./section')

function building(doc, data) {
	const { pc = null, product = null, sensor } = data

	// Модули
	const mdl = correct(data.module.filter((f) => f.buildingId === doc._id))

	// Периферия склада
	// Температура Внутренняя
	const inTemp = correct(sensor.filter((t) => t.owner.id === doc._id && ['tin'].includes(t.type)))
	// Температура Внешняя
	const outTemp = correct(sensor.filter((t) => t.owner.id === doc._id && ['tout'].includes(t.type)))
	// Прогноз погоды
	const tweather = { _id: 1, type: 'tweather', name: 'Прогноз погоды: Температура улицы ' }
	const hweather = { _id: 2, type: 'hweather', name: 'Прогноз погоды: Влажность улицы' }
	// Влажность Внутренняя
	const inMois = correct(sensor.filter((m) => m.owner.id === doc._id && ['hin'].includes(m.type)))
	// Влажность Внешняя
	const outMois = correct(sensor.filter((m) => m.owner.id === doc._id && ['hout'].includes(m.type)))
	// Давление всасывания
	const pin = correct(sensor.filter((el) => el.owner.id === doc._id && el.type === 'pin'))
	// Давление нагнетания
	const pout = correct(sensor.filter((el) => el.owner.id === doc._id && el.type === 'pout'))
	// Разгонные вентиляторы
	let idS = correct(data.section?.filter((el) => el.buildingId === doc._id).map((el) => el._id))
	idS ??= []
	idS.push(doc._id)
	// Разгонный ВНО
	const fan = correct(data.fan.filter((f) => idS.includes(f.owner.id) && f.type === 'accel'))

	// Секции склада
	const sect = correct(data.section.filter((el) => el.buildingId === doc._id).map((el) => section(el, data)))
	// Агрегаты
	const aggregate = correct(data.aggregate.filter((el) => el.buildingId === doc._id))

	const mdlId = mdl?.map((el) => el._id)
	const binding = correct(data.binding.filter((el) => mdlId?.includes(el.moduleId)))
	const obj = {
		...doc,
		pc,
		product,
		mdl,
		inTemp,
		outTemp,
		pin,
		pout,
		inMois,
		outMois,
		tweather,
		hweather,
		// Расчетная влажность
		// Внутренняя
		inCalcMois: { type: 'calcMois' },
		// Внешняя
		outCalcMois: { type: 'calcMois' },
		fan,
		aggregate,
		binding,
		section: sect,
	}
	
	return obj
}

function correct(v) {
	if (Array.isArray(v)) return v.length ? v : null
	return v ? v : null
}

module.exports = building
