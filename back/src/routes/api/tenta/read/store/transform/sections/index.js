// Обрабатываем секции - краткая информация (Карточки секций)
function sections(idB, list, data, obj, result) {
	// Получаем данные для конкретного здания из хранилища
	const bldData = data.retain?.[idB]
	const { heating, valve, fan } = obj
	// const r = {}
	list.forEach((el) => {
		if (el.buildingId !== idB) return
		// const o = {
		result[el._id + '_id'] = el._id
		result[el._id + 'name'] = el.name
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
		// Клапаны секции
		// valve: {},
		// Статус вентилятора секции (по умолчанию "остановлен")
		result[el._id + 'fan'] = 'stop'
		// }
		// Обогрев клапанов секции
		const heatingId = heating.find((e) => e.owner.id === el._id)?._id
		if (heatingId) result.heating = data?.outputEq?.[heatingId]

		// Получем данные для o.valve
		valve.forEach((v) => {
			if (!v.sectionId.includes(el._id)) return
			result[v._id] = {
				val: data?.[v._id]?.val,
				state: data?.[v._id]?.state,
			}
		})
		// Обработка вентиляторов секции
		fan.forEach((f) => {
			if (f.owner.id !== el._id || f.type !== 'fan') return
			const need = ['alarm', 'run']
			// Если текущий статус вентилятора "alarm", пропускаем дальнейшую обработку
			if (result[el._id + 'fan'] === need[0]) return
			const st = data?.[f._id]?.state
			if (!st) return
			if (need.includes(st))result[el._id + 'fan'] = st
		})

		// r[el._id] = o
	})
	// return r
}

module.exports = sections
