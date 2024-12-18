function dnDevice(equip, val, retain, result) {
	const { device, signal, section } = equip
	// Состояние отдельного устройства
	single(device, signal, result)

	// Суммарное состояние по устройствам одного типа и одного владельца
	sum(section, device, result, 'co2')
	sum(section, device, result, 'wetting')
	sum(section, device, result, 'ozon')
}

module.exports = dnDevice

// Состояние отдельного устройства
function single(device, signal, result) {
	// По устройствам deviceList
	device.forEach((doc) => {
		result[doc._id] ??= {}
		// По команде управления binding
		const out = result.outputEq?.[doc._id]
		// По сигналам beep
		doc?.beep?.forEach((be) => {
			result[doc._id].beep ??= {}
			sig = signal.find((s) => s.owner.id === be._id && s?.extra?.id === doc._id)
			if (!sig) return
			result[doc._id].beep[be.code] = { value: result[sig._id], alarm: be.alarm }
		})
		// Состояние устройства
		result[doc._id].state = stateD(result[doc._id].beep, out)
	})
}

// Состояние устройства
function stateD(beep = {}, out) {
	const r = Object.values(beep).find((el) => el.alarm && el.value)
	if (r) return 'alarm'
	if (out) return 'run'
	return 'stop'
}

// Суммарное состояние по устройствам одного code и одного владельца sectionId
function sum(section, device, result, code) {
	result.total ??= {}
	section.forEach((doc) => {
		const arr = device.filter((el) => el.sectionId === doc._id && el.device.code === code)
		result.total[doc._id] ??= {}
		result.total[doc._id].device ??= {}
		result.total[doc._id].device[code] = stateSum(arr, result)
	})
}

// Суммарное состояние
function stateSum(arr, result) {
	if (!arr.length) return 'stop'
	let a = arr.map((el) => result?.[el._id]?.state)
	if (a.every((el) => el === 'stop')) return 'stop'
	if (a.every((el) => el === 'alarm')) return 'alarm'
	if (a.some((el) => el === 'run')) return 'run'
	return 'stop'
}
