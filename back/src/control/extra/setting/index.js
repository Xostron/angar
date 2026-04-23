const setting = require('./setting.js')
const { data: store } = require('@store')
const vCoef = require('./v_coef.js')

// Настройки в которых имеются "Коэффициент в зависимости от"
const _STG = [
	['sys', 'cf', 'kOut'],
	['fan', 'pressure'],
	['mois', 'abs'],
	['mois', 'hout'],
	['co2', 'wait'],
]
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
const calcSetting = (v, obj) => {
	if (!v) return
	obj.data.building.forEach((bld) => {
		// "готовые" настройки для алгоритма
		store.calcSetting[bld._id] = setting(bld, obj)
		// Собираем данные для отображения в настройках клиента
		v.coef ??= {}
		v.coef[bld._id] ??= {}
		vCoef(v, bld._id)
		console.log(111, v.coef)
	})
}

module.exports = calcSetting
