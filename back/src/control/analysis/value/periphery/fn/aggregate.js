// Агрегат
function fnAggregate(equip, val, retain, result) {
	const { aggregate, building } = equip
	// По складу
	building.forEach((doc) => {
		// Агрегаты склада
		const agg = aggregate.filter((el) => el.buildingId === doc._id)
		// Нет агрегатов или склад "Вентиляционный"
		if (!agg.length || doc.type === 'normal') return
		if (doc.type === 'combi') {
			//  TODO обработка агрегатов для склада "Комбинированный"
			aggCombi(doc, agg, equip, val, retain, result)
			return
		}
		// Агрегаты склада "Холодильник"
		aggCold(doc, agg, equip, val, retain, result)
	})
}

module.exports = fnAggregate

// Агрегаты склада "Холодильник"
function aggCold(bld, agg, equip, val, retain, result) {
	const { signal, condenser, module } = equip
	// По агрегату
	agg.forEach((doc) => {
		result[doc._id] ??= {}
		result[doc._id].compressor ??= {}
		// Компрессоры
		doc?.compressorList.forEach((el) => {
			result[doc._id].compressor[el._id] ??= {}
			result[doc._id].compressor[el._id].beep ??= {}
			// Сигналы beep компрессора
			el?.beep?.forEach((be) => {
				// sig = signal.find((s) => s.owner.id === be._id && s.extra.id === el._id) 
				let sig = signal.filter((s) => s.owner.id === be._id && s.extra.id === el._id)
				//****Cигнал текущего склада bld._id (у сигналов**** */
				sig = sig.find((el) => {
					const idB = module.find((m) => m._id === el.module.id)?.buildingId
					return idB === bld._id
				})
				//******** */
				if (!sig) return
				//TODO Инверсия
				result[doc._id].compressor[el._id].beep[be.code] = {
					value: be.reverse ? !result[sig._id] : result[sig._id],
					alarm: be.alarm,
				}
			})
			// Состояние компрессора
			result[doc._id].compressor[el._id].state = stateC(result?.[doc._id]?.compressor?.[el._id]?.beep)
		})
		// Конденсаторы
		result[doc._id].condenser ??= {}
		doc?.condenser?.forEach((el) => {
			result[doc._id].condenser[el._id] ??= {}
			result[doc._id].condenser[el._id].fan ??= []
			// Сигналы конденсатора (вентилятор в работе)
			el?.signal
				?.sort((a, b) => a?.order - b?.order)
				?.forEach((e) => result[doc._id].condenser[el._id].fan.push(result[e._id] ? 'run' : 'stop'))
			// Состояние конденсатора
			result[doc._id].condenser[el._id].state = result[doc._id].condenser[el._id].fan.some((el) => el === 'run')
				? 'run'
				: 'stop'
		})
		// Состояние агрегата
		result[doc._id].state = stateA(result[doc._id]?.compressor)
	})
	sum(bld, agg, result)
}

// Агрегаты склада "Комбинированный"
function aggCombi(doc, agg, equip, val, retain, result) {}

// Состояние компрессора
function stateC(o = {}) {
	const r = Object.values(o).find((el) => el.alarm && el.value)
	if (r) return 'alarm'
	if (o?.run?.value) return 'run'
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
