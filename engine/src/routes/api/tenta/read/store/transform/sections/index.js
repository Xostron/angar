// Обрабатываем секции - краткая информация (Карточки секций)
function sections(idB, type, list, data, obj, result) {
	// Получаем данные для конкретного здания из хранилища
	const bldData = data.retain?.[idB]
	const { heating, valve, fan, cooler } = obj

	// Обогрев клапанов секции (1 обогрев на много секций)
	let h = null
	const idSections = list.filter((s) => s.buildingId == idB).map((s) => s._id)
	const heatings = heating.filter((h) => idSections.includes(h.owner.id))
	if (heatings.length === 1) h = data?.outputEq?.[heatings[0]._id]

	// По секции
	list.forEach((el) => {
		if (el.buildingId !== idB) return
		// Режим работы секции
		result[el._id + 'mode'] = bldData?.mode?.[el._id] ?? null
		// Минимальная и максимальная температура продукта в секции
		result[el._id + 'min'] = {
			value: data?.total?.[el._id]?.tprd?.min?.toFixed(1) ?? undefined,
			state: data?.total?.[el._id]?.tprd?.state,
		}
		result[el._id + 'max'] = {
			value: data?.total?.[el._id]?.tprd?.max?.toFixed(1) ?? undefined,
			state: data?.total?.[el._id]?.tprd?.state,
		}

		// Статус вентилятора секции (по умолчанию "остановлен")
		result[el._id + 'fan'] = 'stop'

		// Обогрев клапанов секции
		if (type !== 'cold') {
			if (h !== null) result[el._id + 'heating'] = h
			else {
				const heatingId = heating.find((e) => e.owner.id === el._id)?._id
				result[el._id + 'heating'] = data?.outputEq?.[heatingId]
			}
		}

		// Получем данные для o.valve
		valve.forEach((v) => {
			if (!v.sectionId.includes(el._id)) return
			result[v._id] = {
				val: data?.[v._id]?.val,
				state: data?.[v._id]?.state,
			}
			result.valve ??= {}
			result.valve[el._id] ??= []
			result.valve[el._id].push(v._id)
		})

		// Обработка вентиляторов секции el
		fan.forEach((f) => {
			const idsClr = cooler?.filter((clr) => clr.sectionId === el._id)?.map((clr) => clr._id)
			if ((f.owner.id !== el._id || f.type !== 'fan') && !idsClr.includes(f.owner.id)) return

			const need = ['alarm', 'run']
			// Если текущий статус вентилятора "alarm", пропускаем дальнейшую обработку
			if (result[el._id + 'fan'] === need[0]) return
			const st = data?.[f._id]?.state
			if (!st) return
			if (need.includes(st)) result[el._id + 'fan'] = st
		})
	})
}

module.exports = sections
