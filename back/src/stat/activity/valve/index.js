module.exports = (code, obj, oData) => {
	const r = web(code, obj, oData) ?? mobile(code, obj, oData) ?? {}

	return { ...r, type: 'valve' }
}

function web(code, obj, oData) {
	if (code !== 's_output') return
	const { valve, building, section } = oData
	const { type, sel, vlvId, setpoint } = obj
	if (type !== 'valve') return { noLog: true }
	let bld, sec, vlv

	for (const key in obj) {
		if (['type', 'sel', 'vlvId', 'setpoint'].includes(key)) continue
		bld = building.find((el) => el._id == key)
		if (!bld) continue
		vlv = valve.find((el) => el._id == vlvId)
		if (!vlv) continue
		sec = section.find((el) => vlv.sectionId.includes(el._id))
		if (!sec) continue
	}

	if (!bld || !sec || !vlv) return { noLog: true }
	let title = `${bld.name} ${bld.code}. ${sec.name}. ${vlv.type == 'in' ? 'Приточный клапан: ' : 'Выпускной клапан: '}`
	if (sel == 'stop') title += 'ручное управление - Стоп'
	if (sel == 'iopn') title += 'ручное управление - Открыть'
	if (sel == 'icls') title += 'ручное управление - Закрыть'
	if (sel == 'popn') title += `ручное управление - Открыть на ${setpoint}%`
	return { bId: bld._id, sId: sec._id, title, value: sel }
}

function mobile(code, obj, oData) {
	if (code !== 'valve') return
	const { valve, building, section } = oData
	const { setpoint, val, vlvId, buildingId, sectionId } = obj
	bld = building.find((el) => el._id == buildingId)
	sec = section.find((el) => el._id == sectionId)
	vlv = valve.find((el) => el._id == vlvId)
	let title = `${bld.name} ${bld.code}. ${sec.name}. ${vlv.type == 'in' ? 'Приточный клапан: ' : 'Выпускной клапан: '}`
	if (val == 'stop') title += 'ручное управление - Стоп'
	if (val == 'opn') title += 'ручное управление - Открыть'
	if (val == 'cls') title += 'ручное управление - Закрыть'
	if (val == 'popn') title += `ручное управление - Открыть на ${setpoint}%`
	return { title }
}
