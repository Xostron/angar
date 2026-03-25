/**
 * Рама испарителей секции
 * @param {*} data Рама склада из глобальных данных obj
 * @param {*} idS ИД секции
 * @returns
 */
function getClr(data, idS) {
	// Испарители секции(соленоид + ВНО + оттайка)
	const coolerS = []
	data?.cooler?.forEach((el) => {
		if (el.sectionId != idS) return
		coolerS.push(transformClr(el, data))
	})
	return coolerS
}

// Рама испарителя
function transformClr(doc, data) {
	return {
		...doc,
		// Соленоиды холода
		solenoid: doc.solenoid.map((el) => {
			const b = data.binding.find((e) => e.owner.id === el._id)
			return { ...el, module: { id: b.moduleId, channel: b.channel } }
		}),
		// ВНО
		fan: data.fan
			.filter((el) => el.owner.id === doc._id)
			.map((el) => {
				const ao = data?.binding.find((b) => b.owner.id === el._id)
				return !ao ? el : { ...el, ao: { id: ao?.moduleId, channel: ao?.channel } }
			}),
		// Оттайка
		heating: data.heating.filter((el) => el.owner.id === doc._id && el.type == 'cooler'),
		// Соленоиды подогрева
		solHeat: data.heating.filter((el) => el.owner.id === doc._id && el.type == 'channel'),
		// Заслонка оттайки
		flap: data.heating.filter((el) => el.owner.id === doc._id && el.type == 'flap'),
	}
}

/**
 * Поиск парных испарителей
 * @param {*} mS Механизмы секции
 * @returns {string[][]} ИД испарителей объединенные в пары по одинаковому ВНО
 */
function coupleClr(mS) {
	const hashClr = mS.coolerS.reduce((rlt, el) => {
		rlt[el._id] = el
		return rlt
	}, {})
	// Разбиваем испарители секции на пары по признаку одинаковых ВНО
	const couple = mS.allFanClr.reduce((rlt, el, i) => {
		// el - ВНО какого-то испарителя
		const uid = el.module.id + '' + el.module.channel
		// Испарители с одинаковыми ВНО
		const pairC = []
		// Берем испаритель и его ВНО (hashClr[idClr].fan) проверяем на схожесть с el по uid
		for (const idClr in hashClr) {
			const f = hashClr[idClr].fan.find((ff) => ff.module.id + '' + ff.module.channel === uid)
			if (f) {
				pairC.push(idClr)
				delete hashClr[idClr]
			}
		}
		rlt.push(pairC)
		return rlt
	}, [])
	return couple
}

module.exports = { transformClr, getClr, coupleClr }
