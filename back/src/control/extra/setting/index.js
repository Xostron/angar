const { getSensor } = require('@tool/command/sensor')
const { fill, cb } = require('./fn')
const { debugJson } = require('@tool/json')

function setting(bld, obj) {
	const { retain, factory } = obj
	const codeP = retain?.[bld._id]?.product?.code
	// список настроек склада
	const kind = bld?.kindList
	const r = {}
	// по настройкам склада
	for (const key of kind) {
		const isPrd = factory[key]?._prd
		fill(r, retain?.[bld._id]?.setting?.[key], factory?.[key], cb, key, codeP, isPrd)
	}
	// Системные настройки: Коэффициенты клапанов
	r.sys ??= {}
	r.sys.cf = coef(r.sys, bld, obj)
	// Настройки влажности: гистерезис абс. влажности
	r.mois ??= {}
	r.mois.hysteresisAbs = coefMois(r.mois, bld, obj)
	// Готовые настройки на сервере (для проверки)
	// debugJson({ newnew: r }, ph.resolve(__dirname))

	return r
}

module.exports = setting

/**
 * Системные настройки: коэффициенты клапанов
 * @param {object} stg Системные настройки
 * @param {object} bld склад
 * @param {object} obj глобальные данные
 * @returns {object}
 */
function coef(stg, bld, obj) {
	const { value, data } = obj
	// Температура улицы (мин)
	const tout = value?.total?.tout?.min
	// Температура продукта
	const tprd = value?.total?.[bld._id]?.tprd?.min

	// Выпускной клапан: Множитель открытия в %: %Out = %In(приточ. клап.) * kOut
	const hyst = 1
	let kOut = stg?.outDefault
	// от меньшего к большему
	if (tout < tprd - stg?.out1?.temp || tout - hyst < tprd - stg?.out1?.temp) kOut = stg?.out1?.k
	if (tout < tprd - stg?.out2?.temp || tout - hyst < tprd - stg?.out2?.temp) kOut = stg?.out2?.k
	if (tout < tprd - stg?.out3?.temp || tout - hyst < tprd - stg?.out3?.temp) kOut = stg?.out3?.k

	// Приточный клапан: Множитель импульсов 5сек * kIn = 15сек откр/закр
	let kIn = 3
	if (tout >= 4) kIn = 3
	if (tout + hyst < 4) kIn = 1

	return { kOut, kIn }
}

/**
 * Настройки влажности: гистерезис абсолютной влажности в зависимости от темп. продукта
 * @param {object} stg настройки влажности
 * @param {object} bld склад
 * @param {object} obj глобальные данные
 * @returns {number} абс влажность
 */
function coefMois(stg, bld, obj) {
	const { value, data } = obj
	// Температура продукта
	const tprd = value?.total?.[bld._id]?.tprd?.min
	const hyst = 0.2

	let habs = stg?.hysteresisAbs
	// от большего к меньшему
	if (tprd < stg?.abs3?.temp || tprd - hyst < stg?.abs3?.t) habs = stg?.abs3?.h
	if (tprd < stg?.abs2?.temp || tprd - hyst < stg?.abs2?.t) habs = stg?.abs2?.h
	if (tprd < stg?.abs1?.temp || tprd - hyst < stg?.abs1?.t) habs = stg?.abs1?.h
	console.log(3333, 'Температура продукта', tprd,'< X;','Влажность: гистерезис абс. влажности', habs)
	return habs
}
