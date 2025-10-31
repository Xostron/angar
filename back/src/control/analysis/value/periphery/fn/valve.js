const { stateV } = require('@tool/command/valve')

// Анализ сигналов: Состояние клапанов
function valve(equip, val, retain, result) {
	const { signal, module, valve, section } = equip
	// valve
	valve.forEach((vlv) => {
		result[vlv._id] ??= {}
		const sectionId = vlv.sectionId[0]
		const buildingId = section.find((el) => el._id === sectionId)?.buildingId ?? null
		// Текущее положение клапана, мс
		const cur = +retain?.[buildingId]?.valvePosition?.[vlv._id] ?? null
		// Время полного открытия, мс
		const full = +retain?.[buildingId]?.valve?.[vlv._id] ?? null
		// Текущее положение в %
		result[vlv._id].val =
			cur !== null && full !== null ? +((cur / full) * 100).toFixed(0) : null
		// Состояние клапана
		result[vlv._id].state = stateV(vlv, result, buildingId, sectionId, equip)
	})
}

module.exports = valve
