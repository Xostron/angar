const { isExtralrm } = require('@tool/message/extralrm')
const { data: store } = require('@store')
const { isErrM } = require('@tool/message/plc_module')
// Агрегат
function fnAggregate(equip, val, retain, result) {
	const { aggregate, building } = equip
	// По складу
	building.forEach((doc) => {
		if (doc.type === 'normal') return
		// Агрегаты склада
		const agg = aggregate.filter((el) => el.buildingId === doc._id)
		// Агрегаты склада "Холодильник" и "Комбинированный"
		aggB(doc, agg, equip, val, retain, result)
	})
}

module.exports = fnAggregate

// Агрегаты склада "Холодильник" и "Комбинированный"
// Для неуправляемых и управляемых агрегатов
// Состояние управляемых агрегатов - здесь рассчитывается предварительно + зависит от результата работы логики (уровень масла в процессе работы)
function aggB(bld, agg, equip, val, retain, result) {
	// Нет агрегатов
	if (!agg.length) return
	const { signal, module, cooler, sensor } = equip
	// По агрегату doc-aggregateList
	agg.forEach((doc) => {
		const clr = cooler.find((el) => el.aggregateListId === doc._id)
		const pin = clr ? sensor.find((el) => el.owner.id === clr._id && el.type === 'pin') : null
		console.log(331, clr, pin)

		result[doc._id] ??= {}
		result[doc._id].compressor ??= {}
		// Компрессоры
		doc?.compressorList.forEach((el) => {
			result[doc._id].compressor[el._id] ??= {}
			result[doc._id].compressor[el._id].beep ??= {}
			// Сигналы beep компрессора
			el?.beep?.forEach((be) => {
				const sig = signal.find((ell) => {
					const idB = module.find((m) => m._id === ell.module.id)?.buildingId
					return idB === bld._id && ell.owner.id === be._id && ell.extra.id === doc._id
				})
				if (!sig) return
				result[doc._id].compressor[el._id].beep[be.code] = {
					value: be.reverse ? !result[sig._id] : result[sig._id],
					alarm: be.alarm,
				}
			})
			// Состояние компрессора на основе beep управляемый/неуправляемый
			const owner = doc._id + '_' + el._id
			if (!doc.aggregate?.slave)
				result[doc._id].compressor[el._id].state = stateC(
					result[doc._id].compressor[el._id].beep
				)
			else {
				result[doc._id].compressor[el._id].state = stateCSlave(
					result[doc._id].compressor[el._id].beep,
					bld._id,
					owner,
					signal,
					doc
				)
			}
		})
		// Конденсаторы
		result[doc._id].condenser ??= {}
		doc?.condenser?.forEach((el) => {
			result[doc._id].condenser[el._id] ??= {}
			result[doc._id].condenser[el._id].fan ??= []
			// Сигналы конденсатора (вентилятор в работе)
			el?.signal
				?.sort((a, b) => a?.order - b?.order)
				?.forEach((e) =>
					result[doc._id].condenser[el._id].fan.push(result[e._id] ? 'run' : 'stop')
				)
			// Состояние конденсатора
			result[doc._id].condenser[el._id].state = result[doc._id].condenser[el._id].fan.some(
				(el) => el === 'run'
			)
				? 'run'
				: 'stop'
		})
		// Состояние агрегата
		result[doc._id].state = stateA(result[doc._id]?.compressor)
	})
	sum(bld, agg, result)
}

// Состояние компрессора неуправляемый
function stateC(o = {}) {
	// Поиск активного аварийного сигнала
	const r = Object.values(o).find((el) => el.alarm && el.value)
	// Найден -> компрессор в аварии
	if (r) return 'alarm'
	// run - beep: неуправляемый (дискретный вход - в работе), управляемый (дискретный выход - управляющий сигнал)
	if (o?.run?.value) return 'run'
	// Состояние Стоп (по-умолчанию)
	return 'stop'
}
// Состояние компрессора управляемый
function stateCSlave(o = {}, bldId, owner, signal, agg) {
	// 1. Модули ПЛК агрегата неисправны?
	const alrM = isAlrM(agg, signal)
	if (alrM) return 'alarm'
	// 2. Авария питания, перегрев двигателя, высокое давление, уровень масла
	const arr = []
	for (const code in o) if (o[code]?.alarm || code === 'oil') arr.push(code)
	// Поиск аварии агрегата
	const r = arr.find((code) => isExtralrm(bldId, owner, code))
	if (r) return 'alarm'
	// 3. run - beep: дискретный выход - управляющий сигнал
	if (o?.run?.value) return 'run'
	// 4. Состояние Стоп (по-умолчанию)
	return 'stop'
}
// Состояние агрегата
function stateA(o = {}, total = false) {
	let arr
	if (total) arr = Object.values(o)
	else arr = Object.values(o).map((el) => el?.state ?? 'stop')
	if (arr.every((el) => el === 'stop')) return 'stop'
	if (arr.every((el) => el === 'alarm')) return 'alarm'
	if (arr.some((el) => el === 'run')) return 'run'
	return 'stop'
}

// Суммарное состояние нескольких агрегатов
function sum(bld, aggregate, result) {
	result.total ??= {}
	result.total[bld._id] ??= {}
	result.total[bld._id].aggregate ??= {}
	result.total[bld._id].aggregate.agg ??= {}
	const agg = aggregate.filter((el) => el.buildingId === bld._id)

	agg.forEach((doc) => {
		result.total[bld._id].aggregate.agg[doc._id] = result[doc._id].state
	})

	result.total[bld._id].aggregate.state = stateA(result.total[bld._id].aggregate.agg, true)
}

/**
 * Модули ПЛК агрегата неисправны?
 * @param {*} agg Рама агрегата
 * @param {*} obj Глобальные данные
 * @param {*} acc Аккумулятор
 * @returns true Неисправны / false Модули ОК
 */
function isAlrM(agg, signal) {
	const arrM = new Set()
	// Найти модули, к которым подключен агрегат
	agg.compressorList.forEach((cmpr) => {
		cmpr.beep.forEach((beep) => {
			const sig = signal.find((el) => el.owner.id === beep._id && el.extra.id === agg._id)
			sig?.module?.id && sig?.module?.channel ? arrM.add(sig.module.id) : null
		})
	})
	console.log(`Агрегат ${agg._id} подключен к модулям:`, arrM)
	// Модуль неисправен?
	return [...arrM].some((idM) => {
		const t = isErrM(agg.buildingId, idM)
		console.log(`\tМодуль ${idM}, авария=${t}`)
		return t
	})
}
