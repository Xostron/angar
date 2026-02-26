/**
 * Устройства секции
 * @param {*} idS ИД секции
 * @param {*} arr Массив устройств
 * @param {*} code Код устройства
 * @returns
 */
function getDevice(idS, device, code) {
	return device.filter((el) => el?.device?.code === code && el?.sectionId === idS)
}

/**
 * fanClr - ВНО испарителей (только рабочие и исключая дубляжи)
 * allFanClr - Все ВНО испарителя (исключая дубляжи)
 * @param {*} idB ИД склада
 * @param {*} idS ИД секции
 * @param {*} coolerS Испарители секции
 * @returns { allFanClr, fanClr } - массив испарителей
 */
function getVnoClr(idB, idS, obj, coolerS) {
	const { retain, value } = obj
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
	const allFanClr = Object.values(
		fanClrRaw.reduce((acc, el, i) => {
			if (acc[el.module.id + el.module.channel]) return acc
			acc[el.module.id + el.module.channel] = el
			return acc
		}, {}),
	)
	return { allFanClr, fanClr }
}

function getVno(idB, idS, obj, binding, fan) {
	const { retain, value } = obj
	// Напорные ВНО секции (только рабочие)
	return fan
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
}

module.exports = { getDevice, getVnoClr, getVno }
