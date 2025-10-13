module.exports = function prepare(bld, obj, acc, m, se, s) {
	// Секции в авто
	const ids = obj.data.section
		.filter((el) => el.buildingId == bld._id && obj.retain[bld._id]?.mode?.[el._id])
		.map((el) => el._id)
	// Рабочие клапаны - закрыты
	let vlv
	ids.forEach((id) => {
		vlv = obj.data.valve.filter((el) => el.sectionId.includes(id))
	})
	vlv = vlv?.every((el) => obj.value[el._id].state == 'cls')
	// Точка росы
	const point = obj.value.total?.[bld._id]?.point
	// Температура продукта
	const tprd = obj.value.total?.[bld._id]?.tprd?.min
	// Показание со2
	const co2 = obj.value.total?.[bld._id]?.co2?.max
	// Относительная влажность улицы
	const hout = obj.value.total?.hout?.max
	// Макс. внешняя отн. влажность
	const automode = obj.retain?.[bld._id]?.automode
	let outMax
	if (automode === 'drying') {
		// Сушка
		outMax = s?.drying?.humidityMax
	} else if (automode === 'cooling') {
		// Хранение
		outMax = s?.mois?.outMax
	}
	// Если данные невалидны (valid=false), то запрет выполнение СО2
	let valid = !isNaN(point) && !isNaN(tprd) && !isNaN(hout) && !isNaN(outMax)
	// для режима по датчику
	valid = s.co2.mode === 'sensor' ? valid && !isNaN(co2) : valid

	return { vlvClose: vlv, point, tprd, co2, hout, outMax, valid, automode }
}
