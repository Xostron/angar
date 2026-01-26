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

module.exports = { transformClr, getClr }
