const { checkS } = require('@tool/command/sensor')

// Данные по pc
function transform(data, building) {
	const { tout, hout } = data?.total ?? {}
	const result = {
		// Данные по building
		list: {},
		// Температура улицы (мин)
		temp: { value: tout?.min?.toFixed(1) ?? undefined, state: tout?.state },
		// Влажность улицы (макс)
		rh: { value: hout?.max?.toFixed(1) ?? undefined, state: hout?.state },
		// Расчетная абсолютная влажность улицы
		ah: { value: data?.humAbs?.out, state: checkS(tout?.state, hout?.state) },
	}
	const retain = data.retain
	if(!retain || !Object?.keys(retain).length) return result
	// По складам
	Object?.keys(retain).forEach((idB) => {
		// TODO:rrp  Надо проверить почему undefined записан как строка
		if(!idB || idB === 'undefined') return
		// Тип склада
		const type = building?.find(el=>el._id === idB)?.type
		const timer = Object.values(data?.alarm?.timer?.[idB] ?? {}).map((el) => ({ code: el?.type, msg: el?.msg }))
		const obj = {
			product: retain?.[idB]?.product?.code ?? null,
			mode: retain?.[idB]?.automode ?? null,
			on: retain?.[idB]?.start ?? null,
			// Влажность продукта (hin)
			rh: { value: data?.total?.[idB]?.hin?.max?.toFixed(1) ?? undefined, state: data?.total?.[idB]?.hin?.state },
			// Температура продукта (tprd)
			min: { value: data?.total?.[idB]?.tprd?.min?.toFixed(1) ?? undefined, state: data?.total?.[idB]?.tprd?.state },
			max: { value: data?.total?.[idB]?.tprd?.max?.toFixed(1) ?? undefined, state: data?.total?.[idB]?.tprd?.state },

			crash: data?.alarm?.count?.[idB] ?? null,
			alarm: Object.keys(data?.alarm?.barB?.[idB] ?? {})
				.map((k) => {
					const alr = data?.alarm?.barB?.[idB]?.[k]?.[0]
					return alr ? { code: k, msg: alr?.msg } : null
				})
				.filter((el) => !!el),			
		}

		obj.alarm.push(...timer)
		// GVM Данные для холодильника
		if(type === 'cold') {
			// Удаляем не нужные ключи для Холодильника
			delete result.temp
			delete result.rh
			delete result.ah
		}
		result.list[idB] = obj
	})
	return result
}
module.exports = transform
