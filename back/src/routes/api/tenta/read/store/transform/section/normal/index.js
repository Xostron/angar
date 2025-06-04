const { get } = require('@tool/get/sensor')
const alarm = require('../../alarm')

// Полное описание секции
function normal(result, idS, idB, obj) {
	const { data, heating, sensor, fan, valve } = obj
	const value = result.value
	// Аварии авторежима секции
	result.alarm = alarm(idB, idS, data)

	// Температура продукта секции
	get('tprd', idS, 'section', sensor).forEach((el) => fe(el, value, data))
	// Температура канала секции
	get('tcnl', idS, 'section', sensor).forEach((el) => fe(el, value, data))
	// Давление секции
	get('p', idS, 'section', sensor).forEach((el) => fe(el, value, data))
	// Статусы вентиляторов секции
	fan.forEach((el) => {
		if (el.owner.id !== idS) return
		value[el._id] = data[el._id]?.state
	})
	// Обогрев клапанов секции
	// const heatingId = heating.find((el) => el.owner.id === idS)?._id
	// if (heatingId) value.vheating = data?.outputEq?.[heatingId]
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
