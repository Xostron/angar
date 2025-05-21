function dnDevice(equip, val, retain, result) {
	const { device, signal, section } = equip
	// Состояние отдельного устройства
	single(equip, result, val)

	// Суммарное состояние по устройствам одного типа и одного владельца
	sum(section, device, result, 'co2')
	sum(section, device, result, 'wetting')
	sum(section, device, result, 'ozon')
}

module.exports = dnDevice

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

// Значения каналов модуля электроизмерений
function pui(doc, result, val) {
	result[doc._id] ??= {}
	if (!doc.module.id || !val?.[doc.module.id]) return
	// console.log(777,doc,val[doc.module.id])
	if (doc.module.name == 'МЭ210-701') puiTCP(doc, result, val)
	else puiRTU(doc, result, val)
}

const puiRTU = (doc, result, val) => {
	// Напряжение
	result[doc._id].Ua = +val[doc.module.id][0]?.toFixed(1)
	result[doc._id].Ub = +val[doc.module.id][2]?.toFixed(1)
	result[doc._id].Uc = +val[doc.module.id][4]?.toFixed(1)
	// Ток
	result[doc._id].Ia = +val[doc.module.id][6]?.toFixed(1)
	result[doc._id].Ib = +val[doc.module.id][8]?.toFixed(1)
	result[doc._id].Ic = +val[doc.module.id][10]?.toFixed(1)
	// активная мощность
	result[doc._id].Pa = +val[doc.module.id][12]?.toFixed(1)
	result[doc._id].Pb = +val[doc.module.id][14]?.toFixed(1)
	result[doc._id].Pc = +val[doc.module.id][16]?.toFixed(1)
}
const puiTCP = (doc, result, val) => {
	// Напряжение
	result[doc._id].Ua = +val[doc.module.id][0]?.toFixed(1)
	result[doc._id].Ub = +val[doc.module.id][1]?.toFixed(1)
	result[doc._id].Uc = +val[doc.module.id][2]?.toFixed(1)
	// Ток
	// result[doc._id].Ia = +val[doc.module.id][6]?.toFixed(1)
	// result[doc._id].Ib = +val[doc.module.id][7]?.toFixed(1)
	// result[doc._id].Ic = +val[doc.module.id][8]?.toFixed(1)
	// активная мощность
	// result[doc._id].Pa = +val[doc.module.id][6]?.toFixed(1)
	// result[doc._id].Pb = +val[doc.module.id][7]?.toFixed(1)
	// result[doc._id].Pc = +val[doc.module.id][8]?.toFixed(1)
}

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
