function section(doc, data) {
	// TODO Добавить cooler, device
	// Датчик со2
	const co2 = correct(
		data.sensor.filter((el) => el.owner.id === doc._id && ['co2'].includes(el.type))
	)
	// Датчики давления
	const p = correct(
		data.sensor.filter((el) => el.owner.id === doc._id && ['p'].includes(el.type))
	)
	// Температура продукта
	const tprd = correct(
		data.sensor.filter((el) => el.owner.id === doc._id && ['tprd'].includes(el.type))
	)
	// Температура канала
	const tcnl = correct(
		data.sensor.filter((el) => el.owner.id === doc._id && ['tcnl'].includes(el.type))
	)
	// Датчики влажности секции
	const mois = correct(
		data.sensor.filter((el) => el.owner.id === doc._id && ['hin'].includes(el.type))
	)
	// Напорные вентиляторы
	const fan = data.fan
		.filter((el) => el.owner.id === doc._id && el.type === 'fan')
		.map((el) => {
			const ao = data.binding.find((b) => b.owner.id === el._id)
			if (!ao) return el
			return { ...el, ao: { id: ao?.moduleId, channel: ao?.channel } }
		})
	// Дополнительные вентиляторы
	const fanAux = data.fan.filter((el) => el.owner.id === doc._id && el.type === 'aux')
	// Клапаны
	const valve = data.valve.filter((el) => el.sectionId.includes(doc._id))
	// Сигналы
	// listId - список id вентиляторов и клапанов секции
	const listId = [...fan, ...valve, { ...doc }].map((el) => el._id)
	const signal = correct(data.signal.filter((el) => listId.includes(el.owner.id)))
	// Подогрев клапанов
	const heating = correct(data.heating.filter((el) => el?.owner?.id === doc._id))
	// Испаритель
	const cooler = correct(data?.cooler.filter((el) => el.sectionId === doc._id))
	// Испаритель: сленоиды, датчики, aggregateListId
	cooler?.forEach((el) => {
		el.sensor = data.sensor.filter((e) => e.owner.id === el._id)
		el.aggregate = data.aggregate?.find((a) => a._id == el.aggregateListId)
		el.fan = data.fan
			?.filter((e) => e.owner.id === el._id)
			?.map((e) => {
				const ao = data.binding.find((b) => b.owner.id === e._id)
				if (!ao) return el
				return { ...e, ao: { id: ao?.moduleId, channel: ao?.channel } }
			})
	})
	// console.log(555,data.aggregate, data.cooler)
	// Давление всасывания агрегата
	const coolerIds = cooler?.map((el) => el._id) ?? []
	const pin = data.sensor.filter((el) => coolerIds.includes(el.owner.id) && el.type === 'pin')
	// Давление нагнетания агрегата
	const pout = data.sensor.filter((el) => coolerIds.includes(el.owner.id) && el.type === 'pout')
	// Устройства
	const device = correct(data?.device.filter((el) => el.sectionId === doc._id))

	const obj = {
		...doc,
		co2,
		p,
		tprd,
		tcnl,
		mois,
		fan: correct(fan),
		fanAux: correct(fanAux),
		valve: correct(valve),
		signal,
		heating,
		cooler,
		device,
		pin,
		pout,
	}
	// console.log(333, obj)
	return obj
}

function correct(v) {
	if (Array.isArray(v)) return v.length ? v : null
	return v ? v : null
}

module.exports = section
