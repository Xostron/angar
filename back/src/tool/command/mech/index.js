// Исполнительные механизмы секции
function mech(data, sId, bldId) {
	const { valve, fan, heating, signal, binding } = data
	// Клапаны
	const vlvS = valve.filter((el) => el.sectionId.includes(sId))
	// Напорные ВНО
	const fanS = fan
		.filter((el) => el.owner.id === sId && el.type === 'fan')
		.map((el) => {
			const ao = binding.find((b) => b.owner.id === el._id)
			if (!ao) return el
			return { ...el, ao: { id: ao?.moduleId, channel: ao?.channel } }
		})
		
	// Дополнительные вентиляторы (пока нигде не применяются)
	const fanAux = fan.filter((el) => el.owner.id === sId && el.type === 'aux')
	// Обогрев клапанов
	const heatS = heating.filter((el) => el?.owner?.id === sId)
	// TODO Обогрев у холодильника
	// const heatCo = heating.filter((el) => el?.owner?.id === sId)
	// Выход "Модуль в работе" для реле безопасности
	const connect = signal.filter((el) => el.owner.id == sId && el.type == 'connect')
	// Выход сигнала Сброс аварии (создается как в секции, так и для склада)
	const reset = signal.filter((el) => (el.owner.id == sId || el.owner.id == bldId) && el.type == 'reset')

	return { vlvS, fanS, fanAux, heatS, connect, reset }
}

// Исполнительные механизмы склада
function mechB(bId, type, obj) {
	// (поиск по складу и секциям)
	const { data } = obj
	//ID склада и секций
	let idS = getId(data?.section, bId)
	// Разгонные вентиляторы
	const fanA = data?.fan?.filter((el) => idS.includes(el.owner.id) && el.type === 'accel')
	// Выход "Модуль в работе" для реле безопасности
	const connect = data?.signal?.filter((el) => idS.includes(el.owner.id) && el.type == 'connect') ?? []
	// Выход Сброс аварии для реле безопасности
	const reset = data?.signal?.filter((el) => idS.includes(el.owner.id) && el.type == 'reset') ?? []
	// Притотчные клапаны склада
	const vlvIn = data?.valve?.filter((el) => idS.includes(el.sectionId[0]) && el.type == 'in') ?? []
	// Оборудование холодильника
	let cold = type == 'cold' || type == 'combi' ? fnCold(bId, obj) : undefined
	return { fanA, connect, reset, vlvIn, cold }
}

// Получить массив ID склада и его секций
function getId(section, bId) {
	const ids = section?.filter((el) => el.buildingId === bId)?.map((el) => el._id) ?? []
	ids.push(bId)
	return ids
}

// Оборудование камеры
function fnCold(idB, obj) {
	//ID склада и камер
	const idS = getId(obj.data?.section, idB)
	// Id камер
	const idSec = idS.filter((el) => el !== idB)
	// Сигналы склада и камер
	const sigB = obj.data.signal.filter((el) => idS.includes(el.owner.id))
	// Агрегаты склада
	const aggr = obj.data.aggregate.filter((el) => el.buildingId === idB)
	// Испарители камеры
	const cooler = []
	obj.data.cooler.forEach((doc) => {
		if (!idSec.includes(doc.sectionId)) return

		doc.solenoid = doc.solenoid.map((el) => {
			const b = obj.data.binding.find((e) => e.owner.id === el._id)
			return { ...el, module: { id: b.moduleId, channel: b.channel } }
		})

		const clr = {
			...doc,
			fan: obj.data.fan
				.filter((el) => el.owner.id === doc._id)
				.map((el) => {
					const ao = obj?.data?.binding.find((b) => b.owner.id === el._id)
					if (!ao) return el
					return { ...el, ao: { id: ao?.moduleId, channel: ao?.channel } }
				}),
			heating: obj.data.heating.filter((el) => el.owner.id === doc._id),
		}

		cooler.push(clr)
	})

	// Подогрев (клапаны, слив воды)
	const heating = obj.data.heating.filter((el) => idS.includes(el.owner.id))
	// Устройства
	const device = {}
	obj.data.device.forEach((el) => {
		if (!idSec.includes(el.sectionId)) return
		const code = el.device.code
		device[code] ??= []
		device[code].push(el)
	})
	return { signal: sigB, aggregate: aggr, cooler, heating, device }
}

module.exports = { mech, mechB, getId }
