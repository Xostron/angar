const { getIdsS } = require('@tool/get/building')
const { data: store } = require('@store/index')

// Статус оборудования для правой панели на странице карточек секций
function fnEquipment(bld, obj) {
	// Массив секций
	const idsS = getIdsS(obj.data.section, bld._id)
	let r = []
	const extra = store.alarm?.extra?.[bld._id]
	// console.log(extra)

	// Разгон. вент.
	r.push(fnAccel(bld._id, idsS, obj, extra))
	// Увлажнитель
	r.push(fnWetting(idsS, obj, extra))
	// Озонатор
	r.push(fnOzon(extra))
	// Окуривание
	r.push(fnSmoking(extra))
	// Обогрев(не существует)
	// Контроль CO2
	r.push(defCO[bld.type](idsS, obj, extra))
	r = r.filter(Boolean)
	// console.log('@@@', r)
	return r
}

module.exports = fnEquipment

function fnAccel(idB, idsS, obj, extra) {
	idsS.push(idB)
	const fanA = obj.data.fan.filter((el) => idsS.includes(el.owner.id) && el.type == 'accel')
	if (!fanA.length) return null

	// console.log(123, Object.keys(extra?.accel ?? {}))
	const r = fanA.some((el) => obj.value?.[el._id]?.state == 'run')
	if (r) return { name: 'Разгон. вент', value: 'Вкл' }

	const mode = Object.keys(extra?.accel ?? {})
	if (mode.includes('time')) return { name: 'Разгон. вент', value: 'Ожидание' }
	if (mode.includes('sensor')) return { name: 'Разгон. вент', value: 'Ожидание' }

	return { name: 'Разгон. вент', value: 'Выкл' }
}

function fnSmoking(extra) {
	const r = Object.keys(extra?.smoking ?? {})
	if (r.includes('smoking1')) return { name: 'Окуривание', value: 'Вкл (Этап1)' }
	if (r.includes('smoking2')) return { name: 'Окуривание', value: 'Ожидание' }
	return { name: 'Окуривание', value: 'Выкл' }
}

function fnOzon(extra) {
	// const ozon = obj.data.device.filter(
	// 	(el) => idsS.includes(el.sectionId) && el.device.code == 'ozon',
	// )
	// if (!ozon.length) return null
	// const r = ozon.some((el) => obj.value?.[el._id]?.state == 'run')
	// if (r) return { name: 'Озонатор', value: 'Вкл (Этап1)' }
	const rr = Object.keys(extra?.ozon ?? {})
	if (rr.includes('ozon2')) return { name: 'Озонатор', value: 'Вкл (Этап1)' }
	if (rr.includes('ozon2')) return { name: 'Озонатор', value: 'Ожидание' }
	return { name: 'Озонатор', value: 'Выкл' }
}

function fnWetting(idsS, obj, extra) {
	const rr = []
	idsS.forEach((idS) => {
		rr.push(...Object.keys(extra?.[idS]?.wetting ?? {}))
	})
	const wetting = obj.data.device.filter(
		(el) => idsS.includes(el.sectionId) && el.device.code == 'wetting',
	)
	if (!wetting.length) return null
	const r = wetting.some((el) => obj.value?.[el._id]?.state == 'run')
	return r ? { name: 'Увлажнитель', value: 'Вкл' } : { name: 'Увлажнитель', value: 'Выкл' }
}

const defCO = {
	cold: fnCoC,
	normal: fnCoNC,
	combi: fnCoNC,
}
// Для обычного/комби
function fnCoNC(idsS, obj, extra) {
	const r = Object.keys(extra?.co2 ?? {})
	if (r.includes('work')) return { name: 'Контроль СО2', value: 'Вкл' }
	if (r.includes('wait') || r.includes('check2') || r.includes('check'))
		return { name: 'Контроль СО2', value: 'Ожидание' }
	return { name: 'Контроль СО2', value: 'Выкл' }
}
// Для холодильника
function fnCoC(idsS, obj, extra) {
	const co2 = obj.data.device.filter(
		(el) => idsS.includes(el.sectionId) && el.device.code == 'co2',
	)
	if (!co2.length) return null
	const r = co2.some((el) => obj.value?.[el._id]?.state == 'run')
	return r ? { name: 'Контроль СО2', value: 'Вкл' } : { name: 'Контроль СО2', value: 'Выкл' }
}
