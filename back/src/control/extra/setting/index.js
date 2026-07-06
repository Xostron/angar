const setting = require('./setting.js')
const { data: store } = require('@store')
const vCoef = require('./v_coef.js')
const coefVlv = require('./fn/coef_vlv')
const coefAbs = require('./fn/coef_abs')
const coefPress = require('./fn/coef_press')
const coefCO2 = require('./fn/coef_co2')
const coefHout = require('./fn/coef_hout')
/**
 * 1) Собираем данные для отображения в настройках клиента
 * "Коэффициент в зависимости от" - активный
 * 2) Сохраняем в аккумулятор (store.calcSetting) "готовые" настройки для алгоритма
 *
 * где bldId - id склада, key - код настройки ('sys', 'fan', 'mois')
 * @param {*} obj Глобальные данные склада
 * @param {*} v Глобальные данные склада для клиента Web
 * @returns
 */
function calcSetting(obj) {
	obj.data.building.forEach((bld) => {
		// "готовые" настройки для алгоритма
		store.calcSetting[bld._id] = setting(bld, obj)
	})
}

function calcCoef(v, obj) {
	if (!v) return
	obj.data.building.forEach((bld) => {
		const r = store.calcSetting[bld._id]
		// Системные настройки: Коэф-ты выпуск. клапана в зависимости от темп. улицы
		r.sys ??= {}
		r.sys.out = coefVlv(r.sys, bld, obj)

		// Настройки влажности: Гистерезис абсолютной влажности в зависимости от температуры продукта
		r.mois ??= {}
		r.mois.abs = coefAbs(r.mois, bld, obj)

		// Настройки вентиляторов: Давление в канале в зависимости от влажности продукта
		r.fan ??= {}
		r.fan.pressure = coefPress(r.fan, bld, obj)

		// Настройки СО2: Время ожидания в зависимости от температуры продукта
		r.co2 ??= {}
		r.co2.wait = coefCO2(r.co2, bld, obj)

		// Настройки Влажности: Относительная влажность в зависимости от температуры улицы
		r.mois ??= {}
		r.mois.hout = coefHout(r.mois, bld, obj)

		v.coef ??= {}
		v.coef[bld._id] ??= {}
		vCoef(v, bld._id)
	})
}

module.exports = { calcSetting, calcCoef }
