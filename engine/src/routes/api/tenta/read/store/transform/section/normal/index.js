const { get } = require('@tool/get/sensor')
const alarm = require('../../alarm')

// Полное описание секции
function normal(result, idS, idB, obj) {
	const { data, heating, sensor, fan, valve, cooler } = obj
	// ИД испарителей данной секции
	const idsClr = cooler.filter((el) => el.sectionId === idS).map((el) => el._id)
	const value = result.value
	// Аварии авторежима секции (TODO удалить result.alarm)
	result.alarm = alarm(idB, idS, data)

	// Температура продукта секции
	get('tprd', idS, 'section', sensor).forEach((el) => fe(el, value, data))
	// Температура канала секции
	get('tcnl', idS, 'section', sensor).forEach((el) => fe(el, value, data))
	// Давление секции
	get('p', idS, 'section', sensor).forEach((el) => fe(el, value, data))

	// Статусы вентиляторов секции
	fan.forEach((el) => {
		if (!idsClr.includes(el.owner.id) && el.owner.id !== idS) return
		value[el._id] =
			data[el._id]?.value === undefined
				? data[el._id]?.state
				: { value: data[el._id]?.state, ao: data[el._id]?.value }
	})

	// Приток in секции
	valve.forEach((el) => {
		if (!el.sectionId.includes(idS)) return
		value[el._id] = {
			val: data?.[el._id]?.val,
			state: data?.[el._id]?.state,
		}
	})
	return
}

module.exports = normal

function fe(el, o, data) {
	o[el._id] = {
		value: data?.[el._id]?.state === 'on' ? data?.[el._id]?.value : undefined,
		state: data?.[el._id]?.state,
	}
}
