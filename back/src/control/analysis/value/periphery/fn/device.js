const pui = require('./pui')

function fnDevice(equip, val, retain, result) {
	const { device, signal, section } = equip
	// Состояние отдельного устройства
	single(equip, result, val)

	// Суммарное состояние по устройствам одного типа и одного владельца
	sum(section, device, result, 'co2')
	sum(section, device, result, 'wetting')
	sum(section, device, result, 'ozon')
}

module.exports = fnDevice

// Состояние отдельного устройства
function single(equip, result, val) {
	const { device, signal, module, equipment } = equip
	// По устройствам deviceList
	device.forEach((doc) => {
		const equipId = module.find((el) => el._id == doc.module.id)?.equipmentId
		if (!equipId) return
		doc.module.name = equipment[equipId].name
		if (doc.device.code === 'pui') pui(doc, result, val)
		other(doc, signal, result)
	})
}

/**
 * Состояние устройства
 * Анализ beep сигналов устройства
 * Устроство содержит ключ beep:объект со значениями beep
 * @param {*} doc Рама устройства
 * @param {*} signal Рама сигналов
 * @param {*} result Результат
 */
function other(doc, signal, result) {
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
}

/**
 * Состояние устройства
 * @param {*} beep объект со значениями beep конкретного устройства
 * @param {*} out DO устройства
 * @returns {string} alarm|run|stop
 */
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
