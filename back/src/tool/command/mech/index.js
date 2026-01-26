const { getIdBS } = require('@tool/get/building')
const { transformClr, getClr } = require('./fn')

// Исполнительные механизмы секции
function mech(obj, idS, idB) {
	const { data, retain, value } = obj
	const { valve, fan, heating, signal, binding, cooler, device } = data

	// Увлажнитель
	const wettingS = device.filter((el) => el?.device?.code === 'wetting' && el?.sectionId === idS)

	// Клапаны (приточный и выпускной)
	const vlvS = valve.filter((el) => el.sectionId.includes(idS))
	// Обогрев клапанов
	const heatS = heating.filter((el) => el?.owner?.id === idS)
	// Испарители секции(соленоид + ВНО + оттайка)
	const coolerS = getClr(data, idS)
	// ВНО испарителей (только рабочие и исключая дубляжи: 1 ВНО на 2 и более испарителя)
	// Вно испарителей (все вно, включая дубляжи)
	const fanClrRaw = coolerS.flatMap((el) => el.fan)
	// Вно испарителей (только рабочие state!=alarm и state!=off)
	let fanClr = fanClrRaw.filter(
		(el) => value[el._id].state != 'alarm' && !retain?.[idB]?.fan?.[idS]?.[el._id],
	)
	// Вно испарителей (только рабочие state!=alarm и state!=off и без дубляжей)
	fanClr = Object.values(
		fanClr.reduce((acc, el, i) => {
			if (acc[el.module.id + el.module.channel]) return acc
			acc[el.module.id + el.module.channel] = el
			return acc
		}, {}),
	)
	// Вно испарителей с любым state, но исключая дубляжи
	let allFanClr = Object.values(
		fanClrRaw.reduce((acc, el, i) => {
			if (acc[el.module.id + el.module.channel]) return acc
			acc[el.module.id + el.module.channel] = el
			return acc
		}, {}),
	)
	// Испаритель: соленоид подогрева
	const solHeatS = coolerS.flatMap((el) => el.solHeat)
	// Напорные ВНО секции обычного склада/камеры холодильника (только рабочие)
	const fanSS = fan
		.filter(
			(el) =>
				el.owner.id === idS &&
				el.type === 'fan' &&
				value[el._id].state != 'alarm' &&
				!retain?.[idB]?.fan?.[idS]?.[el._id],
		)
		.map((el) => {
			const ao = binding.find((b) => b.owner.id === el._id)
			if (!ao) return el
			return { ...el, ao: { id: ao?.moduleId, channel: ao?.channel } }
		})
	// Напорные ВНО секции/камеры + ВНО испарителей: обычный/комби склад в режиме обычного (только рабочие)
	const fanS = [...fanSS, ...fanClr]

	// Дополнительные вентиляторы (пока нигде не применяются)
	// const fanAux = fan.filter((el) => el.owner.id === idS && el.type === 'aux')

	// Выход "Модуль в работе" для реле безопасности
	const connect = signal.filter((el) => el.owner.id == idS && el.type == 'connect')
	// Выход сигнала Сброс аварии (создается как в секции, так и для склада)
	const reset = signal.filter(
		(el) => (el.owner.id == idS || el.owner.id == idB) && el.type == 'reset',
	)
	// Напорные ВНО секции для extralrm (отслеживание аварий)
	const fanSAll = [...fan.filter((el) => el.owner.id === idS && el.type === 'fan'), ...fanClr]
	return {
		vlvS,
		fanS,
		fanSS,
		heatS,
		connect,
		reset,
		coolerS,
		solHeatS,
		fanSAll,
		fanClr,
		wettingS,
		allFanClr,
	}
}

// Исполнительные механизмы склада
function mechB(bId, type, obj) {
	// (поиск по складу и секциям)
	const { data } = obj

	//ID склада и секций
	let idS = getIdBS(data?.section, bId)
	// Увлажнители склада
	const wettingS = data.device.filter(
		(el) => el?.device?.code === 'wetting' && idS.includes(el.sectionId),
	)
	// Озонаторы склада
	const ozon = data.device.filter(
		(el) => el?.device?.code === 'ozon' && idS.includes(el.sectionId),
	)
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
	// Все клапаны склада
	const vlvAll = data?.valve?.filter((el) => idS.includes(el.sectionId[0])) ?? []
	// Все обогревы клапанов
	const heatingAll =
		data?.heating?.filter((el) => idS.includes(el.owner.id) && el.type === 'heating') ?? []
	// Все оттайки слива воды
	const heatingWAll =
		data?.heating?.filter((el) => idS.includes(el.owner.id) && el.type === 'water') ?? []
	// Оборудование холодильника
	let cold = type == 'cold' || type === 'combi' ? fnCold(bId, obj) : undefined
	// Все оттайки испарителей
	const clrsId = cold?.cooler?.map((el) => el._id) ?? []
	const heatingClrAll =
		data?.heating?.filter((el) => clrsId.includes(el.owner.id) && el.type === 'cooler') ?? []
	// Все зслонки испарителей
	const flapClrAll =
		data?.heating?.filter((el) => clrsId.includes(el.owner.id) && el.type === 'flap') ?? []

	// Все вентиляторы склада: напорные, разгонные вно испарителей
	const fanAll = data?.fan
		?.filter((el) => idS.includes(el.owner.id))
		.map((el) => {
			// Поиск аналогового выхода ВНО
			const ao = data.binding.find((b) => b.owner.id == el._id && b.type == 'ao')
			if (!!ao) el.ao = { id: ao?.moduleId, channel: ao?.channel }
			return el
		})
	// Если склад типа холодильник
	if (cold) fanAll.push(...cold.fan)

	// ИМ секции
	const sect = {}
	data?.section
		.filter((el) => el.buildingId === bId)
		.forEach((el) => {
			sect[el._id] = mech(obj, el._id, bId)
		})

	return {
		fanA,
		connect,
		reset,
		vlvIn,
		cold,
		fanAll,
		connectLost,
		wettingS,
		vlvAll,
		heatingAll,
		heatingWAll,
		heatingClrAll,
		flapClrAll,
		sect,
		ozon,
	}
}

// Оборудование камеры
function fnCold(idB, obj) {
	//ID склада и камер
	const idS = getIdBS(obj.data?.section, idB)
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
	// ВНО испарителей
	const fan = cooler.flatMap((el) => el.fan)
	return { signal: sigB, aggregate: aggr, cooler, heating, device, slaveAgg, fan }
}

module.exports = { mech, mechB }
