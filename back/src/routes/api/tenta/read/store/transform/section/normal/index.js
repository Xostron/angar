const { get } = require('@tool/get/sensor')
const alarm = require('../../alarm')

function normal(result, idS, idB, obj) {
	const { data, heating, sensor, fan, valve } = obj
	const value = result.value
	// Аварии авторежима секции
	result.alarm = alarm(idB, idS, data)
	// Температура улицы (мин)
	// value.temp =  { value: data?.total?.tout?.min?.toFixed(1) ?? undefined, state: data?.total?.tout?.state }
	// Влажность улицы (макс)
	// value.rh = { value: data?.total?.hout?.max?.toFixed(1) ?? undefined, state: data?.total?.hout?.state }
	// Расчетная абсолютная влажность улицы
	// value.ah = { value: data?.humAbs?.out, state: checkS(data?.total?.tout?.state, data?.total?.hout?.state) }
	// Абсолютная влажность продукта
	// value.ahb = {
	//     value: data?.humAbs?.[idB],
	//     state: checkS(data?.total?.[idB]?.hin?.state, data?.total?.[idB]?.tprd?.state),
	// }

	// console.log(111, 'ИТОГО: ', result.alarm)
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
	const heatingId = heating.find((el) => el.owner.id === idS)?._id
	if (heatingId) value.vheating = data?.outputEq?.[heatingId]
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
