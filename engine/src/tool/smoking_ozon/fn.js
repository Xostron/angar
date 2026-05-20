const { mech } = require('@tool/command/mech')
const { delExtra } = require('@tool/message/extra')
const { data: store } = require('@store')

/**
 * Распределить секционные ВНО по секциям
 * @param {object} fan Все ВНО склада
 * @returns
 */
function collect(idB, idsS, obj, stg) {
	const r = {}
	idsS.forEach((idS) => {
		r[idS] = { fanFC: null, fans: null, mode: obj.retain?.[idB]?.mode?.[idS] ?? null }
		// Получить ВНО
		const mS = mech(obj, idS, idB)
		// Преобразовать для плавного пуска
		transform(idB, idS, mS, obj, stg, r)
	})
	return r
}
// Собираем
function transform(idB, idS, mS, obj, stg, r) {
	// Испарители, принадлежащие текущей секции
	const coolerIds = obj.data?.cooler?.filter((el) => el.sectionId == idS).map((el) => el._id)
	// ВНО испарителей данной секции (управляем ими как обычными ВНО без ПЧ)
	let fansCoo = mS.fanS
		.filter((el) => coolerIds.includes(el.owner.id) && el.type == 'fan')
		.sort((a, b) => a?.order - b?.order)
	// ВНО без ПЧ секции
	const fans = mS.fanS
		.filter((el) => el.owner.id === idS && !el?.ao && el.type == 'fan')
		.sort((a, b) => a?.order - b?.order)
	// ВНО с ПЧ секции
	const fansFC = mS.fanS
		.filter((el) => el.owner.id === idS && el?.ao)
		.sort((a, b) => a?.order - b?.order)

	// Выделяем главный ВНО с ПЧ (fanFC)
	const fanFC = fansFC?.[0]
	// Выделяем остальные ВНО: обычные ВНО, ВНО испарителей, ВНО+ПЧ (если fansFC>1)
	if (fansFC.length > 1) {
		fans.push(...fansFC.slice(1, fansFC.length))
		fans.sort((a, b) => a?.order - b?.order)
	}
	fans.push(...fansCoo)

	// Тип управления: с ПЧ или реле
	const type = fanFC ? 'fc' : 'relay'
	// Результат
	r[idS].fanFC = fanFC
	r[idS].fans = fans
	r[idS].type = type
	// Настройка максимальное количество ВНО в окуривании
	fnLimit(r[idS], stg?.max ?? 3)
	return r
}

function fnClear(idB, key = 'smoking') {
	delExtra(idB, null, `${key}1`)
	delExtra(idB, null, `${key}2`)
	// Удаляем аккумулятор плавного пуска по завершению окуривания
	delete store?.heap?.[key]
}

module.exports = { fnClear, collect }

/**
 * Настройка максимальное количество ВНО в окуривании
 * @param {*} r Конфиг для плавного пуска
 * @param {*} max Настройка окуривания: Максимальное количество ВНО
 */
function fnLimit(r, max) {
	// Проверка, найден ли ВНО+ПЧ (count - оставшееся кол-во ВНО)
	let count = r.fanFC ? max - 1 : max
	// Берем оставшиеся ВНО
	r.fans = r.fans.slice(0, count)
}
