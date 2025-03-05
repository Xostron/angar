// Настройки датчиков
module.exports = (code, obj, oData) => {
	console.log(555, code)
	const { title, bId } = web(code, obj, oData) ?? mobile(code, obj, oData) ?? {}
	return {
		title,
		bId,
		type: 'sensor',
	}
}

function web(code, obj, oData) {
	if (code !== 's_sens') return
	const { sensor } = oData
	const bId = Object.keys(obj)[0]
	let title = []
	console.log(777, obj)
	for (const sensId in obj[bId]) {
		let sens = {}
		if (['tweather', 'hweather'].includes(sensId)) sens.name = 'Прогноз погоды: Температура улицы'
		else sens = sensor.find((el) => el._id === sensId)
		const on = obj[bId][sensId].on
		const corr = obj[bId][sensId].corr

		if (on === true) {
			if (corr) title.push(`${sens.name} введен(а) в работу, коррекция = ${corr}`)
			else title.push(`${sens.name} введен(а) в работу`)
		}
		if (on === false) {
			if (corr) title.push(`${sens.name} выведен(а) из работы, коррекция = ${corr}`)
			else title.push(`${sens.name} выведен(а) из работы`)
		}
		if (on === undefined) {
			if (corr) title.push(`${sens.name}: коррекция = ${corr}`)
		}
	}
	return { title: title.length > 1 ? title.join('; ') : title.join(), bId }
}

function mobile(code, o, oData) {
	if (code !== 'sensor') return
	const { sensor, retain } = oData
	const { buildingId, obj } = o
	let title = []

	for (const sensId in obj) {
		let sens = {}
		if (['tweather', 'hweather'].includes(sensId)) sens.name = 'Прогноз погоды: Температура улицы'
		else sens = sensor.find((el) => el._id === sensId)
		let on, corr
		// Выявляем различия нового значение от retain
		if (obj[sensId].on != retain?.[buildingId]?.[sensId]?.on) on = obj[sensId].on
		if (obj[sensId].corr != retain?.[buildingId]?.[sensId]?.corr) corr = obj[sensId].corr

		if (on === true) {
			if (corr) title.push(`${sens.name} введен(а) в работу, коррекция = ${corr}`)
			else title.push(`${sens.name} введен(а) в работу`)
		}
		if (on === false) {
			if (corr) title.push(`${sens.name} выведен(а) из работы, коррекция = ${corr}`)
			else title.push(`${sens.name} выведен(а) из работы`)
		}
		if (on === undefined) {
			if (corr) title.push(`${sens.name}: коррекция = ${corr}`)
		}
	}
	return { title: title.length > 1 ? title.join('; ') : title.join() }
}
