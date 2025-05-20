const { cValue } = require('@socket/emit')
const { readAll } = require('@tool/json')
const read = require('./read')
const value = require('./value')
const setting = require('@control/extra/setting')
const { data: store } = require('@store')
/**
 * Анализ данных с модулей ПЛК и отправка на Web-клиент
 * @param {*} obj объект данных для работы основного цикла
 */
async function analysis(obj) {
	// файлы json - оборудование, пользовательские настройки, заводские настройки
	await readAll(obj)
	// Опрос модулей по сети
	let v = await read(obj)
	// console.log(777, 'AO', v['6800b9d356c6a01c90ecbc72'])
	// Анализ - данные для клиента и работы алгоритма
	v = await value(v, obj)
	// Настройки складов (обработанные для расчетов)
	calcSetting(obj, v)
	// Передача мяса по Socket.io на web-клиент
	console.log(33, v.coef)
	await cValue(v)
}

module.exports = analysis

// Настройки в которых имеются "Коэффициент в зависимости от"
const _STG = [
	['sys', 'cf', 'kOut'],
	['fan', 'pressure'],
	['mois', 'abs'],
]
/**
 * На клиенте в настройках "Коэффициент в зависимости от" -
 * должен показываться коэффициент по которому работает алгоритм)
 * данная функция формирует "готовые" настройки для алгоритма (store.calcSetting) +
 * данные для клиента с активными коэффициентами (v.coef[bldId][key],
 * где bldId - id склада, key - код настройки ('sys', 'fan', 'mois')
 * @param {*} obj Глобальные данные склада
 * @param {*} v Глобальные данные склада для клиента Web
 * @returns
 */
const calcSetting = (obj, v) =>
	obj.data.building.forEach((bld) => {
		store.calcSetting[bld._id] = setting(bld, obj)
		v.coef ??= {}
		v.coef[bld._id] ??= {}
		for (const key in store.calcSetting[bld._id]) {
			const s = _STG.find((el) => el[0] == key)
			if (!s) continue
			const [_, field1, field2] = s
			// console.log(77, key, field1, field2)
			v.coef[bld._id][key] = !field2 ? store.calcSetting[bld._id][key][field1] : store.calcSetting[bld._id][key][field1][field2]
		}
	})
