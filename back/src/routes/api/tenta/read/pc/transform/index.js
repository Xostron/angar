const { checkS } = require('@tool/get/sensor')
const { data: store } = require('@store')

// Данные по pc (карточки складов)
function transform(data, building, section, fan) {
	const { tout, hout } = data?.total ?? {}
	const result = {
		// Температура улицы (мин)
		temp: { value: tout?.min?.toFixed(1) ?? undefined, state: tout?.state },
		// Влажность улицы (макс)
		rh: { value: hout?.max?.toFixed(1) ?? undefined, state: hout?.state },
		// Расчетная абсолютная влажность улицы
		ah: { value: data?.humAbs?.out?.com ?? undefined, state: checkS(tout?.state, hout?.state) },
	}

	// По складам
	building.forEach((el) => fnTransform(el, data, section, fan, result))

	// GVM Данные для холодильника
	if (building.every((el) => el.type == 'cold')) {
		// Удаляем не нужные ключи для Холодильника
		delete result.temp
		delete result.rh
		delete result.ah
	}

	return result
}

module.exports = transform

function fnTransform(bld, data, section, fan, result) {
	// TODO:rrp  Надо проверить почему undefined записан как строка
	if (!bld._id || bld._id === 'undefined') return
	// Тип склада
	result[bld._id + 'product'] = data?.retain?.[bld._id]?.product?.code ?? null
	result[bld._id + 'mode'] = store.value?.building?.[bld._id]?.submode?.[0] ?? data?.retain?.[bld._id]?.automode ?? null
	result[bld._id + 'count'] = data?.retain?.[bld._id]?.drying?.count ?? data?.retain?.[bld._id]?.drying?.acc ?? 0
	result[bld._id + 'on'] = data?.retain?.[bld._id]?.start ?? null
	// Влажность продукта (hin)
	result[bld._id + 'rh'] = { value: data?.total?.[bld._id]?.hin?.max?.toFixed(1) ?? undefined, state: data?.total?.[bld._id]?.hin?.state }
	// Температура продукта (tprd)
	result[bld._id + 'min'] = { value: data?.total?.[bld._id]?.tprd?.min?.toFixed(1) ?? undefined, state: data?.total?.[bld._id]?.tprd?.state }
	result[bld._id + 'max'] = { value: data?.total?.[bld._id]?.tprd?.max?.toFixed(1) ?? undefined, state: data?.total?.[bld._id]?.tprd?.state }

	// Количество аварий
	result[bld._id + 'crash'] = data?.alarm?.count?.[bld._id] ?? null
	// Об авариях
	result[bld._id + 'alarm'] = Object.keys(data?.alarm?.barB?.[bld._id] ?? {})
		.map((k) => {
			const alr = data?.alarm?.barB?.[bld._id]?.[k]?.[0]
			return alr ? { code: k, msg: alr?.msg } : null
		})
		.filter((el) => !!el)
	// Сообщение достижений
	result[bld._id + 'note'] = data.alarm?.achieve?.[bld._id] ?? null
	// Таймеры запретов
	const timer = Object.values(data?.alarm?.timer?.[bld._id] ?? {}).map((el) => ({ code: el?.type, msg: el?.msg }))
	result[bld._id + 'alarm'].push(...timer)

	// Общее состояние ВНО (кроме холодильника)
	if (bld.type !== 'cold') {
		const sec = section.filter((el) => el.buildingId == bld._id).map((el) => el._id)
		const f = fan.filter((el) => el.type == 'fan' && sec.includes(el.owner.id))
		const run = f.some((el) => store.value?.[el._id]?.state === 'run')
		result[bld._id + 'fan'] = run ? 'run' : 'stop'
	}
}
