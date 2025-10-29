// Исполнительные механизмы секции
function mech(obj, idS, idB) {
	const { data, retain, value } = obj
	const { valve, fan, heating, signal, binding, cooler } = data
	// Клапаны и обогрев (приточный и выпускной)
	const vlvS = valve.filter((el) => el.sectionId.includes(idS))
	const heatS = heating.filter((el) => el?.owner?.id === idS)
	// Испарители секции(соленоид + ВНО + оттайка)
	const coolerS = []
	cooler.forEach((el) => {
		if (el.sectionId != idS) return
		coolerS.push(transformClr(el, data))
	})
	// ВНО испарителей (только рабочие и исключая дубляжи: 1 ВНО на 2 и более испарителя)
	let fanClr = coolerS
		.flatMap((el) => el.fan)
		.filter((el) => value[el._id].state != 'alarm' && !retain?.[idB]?.fan?.[idS]?.[el._id])
	fanClr = Object.values(
		fanClr.reduce((acc, el, i) => {
			if (acc[el.module.id + el.module.channel]) return acc
			acc[el.module.id + el.module.channel] = el
			return acc
		}, {})
	)
	console.log(6767, fanClr)
	// Испаритель: соленоид подогрева
	const solHeatS = coolerS.flatMap((el) => el.solHeat)
	// Напорные ВНО секции обычного склада/камеры холодильника (только рабочие)
	const fanSS = fan
		.filter(
			(el) =>
				el.owner.id === idS &&
				el.type === 'fan' &&
				value[el._id].state != 'alarm' &&
				!retain?.[idB]?.fan?.[idS]?.[el._id]
		)
		.map((el) => {
			const ao = binding.find((b) => b.owner.id === el._id)
			if (!ao) return el
			return { ...el, ao: { id: ao?.moduleId, channel: ao?.channel } }
		})
	// Напорные ВНО секции/камеры + ВНО испарителей: обычный/комби склад в режиме обычного
	// TODO fanClr отфильтровать только по рабочим
	const fanS = [...fanSS, ...fanClr]

	// Дополнительные вентиляторы (пока нигде не применяются)
	// const fanAux = fan.filter((el) => el.owner.id === idS && el.type === 'aux')

	// Выход "Модуль в работе" для реле безопасности
	const connect = signal.filter((el) => el.owner.id == idS && el.type == 'connect')
	// Выход сигнала Сброс аварии (создается как в секции, так и для склада)
	const reset = signal.filter(
		(el) => (el.owner.id == idS || el.owner.id == idB) && el.type == 'reset'
	)
	// Напорные ВНО секции для extralrm (отслеживание аварий)
	const fanSAll = [...fan.filter((el) => el.owner.id === idS && el.type === 'fan'), ...fanClr]
	return { vlvS, fanS, fanSS, heatS, connect, reset, coolerS, solHeatS, fanSAll }
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
	const connect =
		data?.signal?.filter((el) => idS.includes(el.owner.id) && el.type == 'connect') ?? []
	// Выход "Модуль в работе" для реле безопасности
	const connectLost =
		data?.signal?.filter((el) => idS.includes(el.owner.id) && el.type == 'connect_lost') ?? []
	// Выход Сброс аварии для реле безопасности
	const reset =
		data?.signal?.filter((el) => idS.includes(el.owner.id) && el.type == 'reset') ?? []
	// Приточные клапаны склада
	const vlvIn =
		data?.valve?.filter((el) => idS.includes(el.sectionId[0]) && el.type == 'in') ?? []
	// Оборудование холодильника
	let cold = type == 'cold' || type == 'combi' ? fnCold(bId, obj) : undefined
	// Все вентиляторы склада
	const fanAll = data?.fan
		?.filter((el) => idS.includes(el.owner.id))
		.map((el) => {
			// Поиск аналогового выхода ВНО
			const ao = data.binding.find((b) => b.owner.id == el._id && b.type == 'ao')
			if (!!ao) el.ao = { id: ao?.moduleId, channel: ao?.channel }
			return el
		})

	return { fanA, connect, reset, vlvIn, cold, fanAll, connectLost }
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
	// Агрегаты склада все
	const aggr = obj.data.aggregate.filter((el) => el.buildingId === idB)
	// Управляемые агрегаты
	const slaveAgg = aggr.filter((el) => el.aggregate.slave)
	// Испарители камеры
	const cooler = []
	obj.data.cooler.forEach((doc) => {
		if (!idSec.includes(doc.sectionId)) return
		cooler.push(transformClr(doc, obj.data))
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
	return { signal: sigB, aggregate: aggr, cooler, heating, device, slaveAgg }
}

function transformClr(doc, data) {
	return {
		...doc,
		solenoid: doc.solenoid.map((el) => {
			const b = data.binding.find((e) => e.owner.id === el._id)
			return { ...el, module: { id: b.moduleId, channel: b.channel } }
		}),
		fan: data.fan
			.filter((el) => el.owner.id === doc._id)
			.map((el) => {
				const ao = data?.binding.find((b) => b.owner.id === el._id)
				return !ao ? el : { ...el, ao: { id: ao?.moduleId, channel: ao?.channel } }
			}),
		heating: data.heating.filter((el) => el.owner.id === doc._id && el.type == 'cooler'),
		solHeat: data.heating.filter((el) => el.owner.id === doc._id && el.type == 'channel'),
	}
}

module.exports = { mech, mechB, getId }
