const { fill, cb } = require('./fn')
const { debugJson } = require('@tool/json')
const { data: store } = require('@store')
const coefVlv = require('./fn/coef_vlv')
const coefAbs = require('./fn/coef_abs')
const coefPress = require('./fn/coef_press')

function setting(bld, obj) {
	const { retain, factory } = obj
	const codeP = retain?.[bld._id]?.product?.code
	// console.log(999, 'Аккумулятор гистерезисов', store.heap)
	// список настроек склада
	const kind = bld?.kindList
	const r = {}
	// по настройкам склада
	for (const key of kind) {
		const isPrd = factory?.[key]?._prd
		fill(r, retain?.[bld._id]?.setting?.[key], factory?.[key], cb, key, codeP, isPrd)
	}
	// Системные настройки: Коэф-ты выпуск. клапана в зависимости от темп. улицы
	r.sys ??= {}
	r.sys.cf = coefVlv(r.sys, bld, obj)
	// Настройки влажности: Гистерезис абсолютной влажности в зависимости от температуры продукта
	r.mois ??= {}
	r.mois.abs = coefAbs(r.mois, bld, obj)
	// Настройки вентиляторов: Давление в канале в зависимости от влажности продукта
	r.fan ??= {}
	r.fan.pressure = coefPress(r.fan, bld, obj)
	// Готовые настройки на сервере (для проверки)
	// debugJson({ newnew: r }, ph.resolve(__dirname))
	return r
}

module.exports = setting
