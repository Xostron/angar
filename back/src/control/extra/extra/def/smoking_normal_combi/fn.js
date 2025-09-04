const { mech } = require('@tool/command/mech')

/**
 * Распределить секционные ВНО по секциям
 * @param {object} fan Все ВНО склада
 * @returns
 */
function collect(fan, idB, idsS, obj) {
	const r = {}
	idsS.forEach((idS) => {
		r[idS] = { fanFC: null, fans: null, mode: obj.retain?.[idB]?.mode?.[idS] ?? null }
		// Получить ВНО
		const mS = mech(obj, idS, idB)
		// Преобразовать для плавного пуска
		transform(idB, idS, mS, obj, r)
	})
	return r
}
// Собираем
function transform(idB, idS, mS, obj, r) {
	// Испарители, принадлежащие текущей секции
	const coolerIds = obj.data?.cooler?.filter((el) => el.sectionId == idS).map((el) => el._id)
	// ВНО испарителей данной секции (управляем ими как обычными ВНО без ПЧ)
	const fansCoo = mS.fanS
		.filter((el) => coolerIds.includes(el.owner.id) && el.type == 'fan')
		.sort((a, b) => a?.order - b?.order)
	// ВНО без ПЧ
	const fans = mS.fanS
		.filter((el) => el.owner.id === idS && !el?.ao && el.type == 'fan')
		.sort((a, b) => a?.order - b?.order)
	// ВНО с ПЧ
	const fansFC = mS.fanS
		.filter((el) => el.owner.id === idS && el?.ao)
		.sort((a, b) => a?.order - b?.order)
	// Выделяем главный ВНО с ПЧ (fanFC) и все остальные ВНО
	const fanFC = fansFC?.[0]
	if (fansFC.length > 1) {
		fans.push(...fansFC.slice(1, fansFC.length))
		fans.sort((a, b) => a?.order - b?.order)
	}
	// Обычные ВНО + ВНО испарителей
	fans.push(...fansCoo)
	// Тип управления: с ПЧ или реле
	const type = fanFC ? 'fc' : 'relay'
	// Результат
	r[idS].fanFC = fanFC
	r[idS].fans = fans
	r[idS].type = type
	return r
}

function fnClear(idB) {
	delExtra(idB, null, 'smoking1')
	delExtra(idB, null, 'smoking2')
}

module.exports = { fnClear, collect }
