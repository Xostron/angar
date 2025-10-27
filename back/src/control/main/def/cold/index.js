const extralrm = require('@control/extra/extralrm')
const { extra, extraClear } = require('@control/extra/extra')
const main = require('./main/def')

// Склад холодильник
function cold(building, obj, bdata) {
	// console.log(1111, `\t${building?.type==='combi'? 'Комбинированный холод':'Холодильный'} склад - процесс`, building?.type)
	// Доп функции
	const alr = runExtra(building, obj, bdata)
	// Алгоритм управления камерой
	main[building?.type](building, obj, bdata, alr)
}

module.exports = cold

/**
 * @description Запуск обработки доп. функций (extra) и доп. аварий (extralrm)
 * @param {object} building Склад
 * @param {object} obj Глобальные данные
 * @param {object} bdata Подготовленные данные для склада
 * @returns {boolean} true - авария, false - ОК: нет аварий
 */
function runExtra(building, obj, bdata) {
	const { start, s, se, m, accAuto } = bdata
	let alr = false
	// Тип склада cold - холодильник, combi - комбинированный
	const type = building?.type
	// Всегда
	alr = alr || extralrm(building, null, obj, s, se, m, null, null, type, 'always')
	extra(building, null, obj, s, se, m, null, null, null, type, 'always')
	console.log('@@@@@@@@@@@@@@@@@@ alr=', alr)

	// Склад выключен
	if (!start) {
		extra(building, null, obj, s, se, m, null, null, null, type, 'off')
		return alr
	} else extraClear(building, null, obj, s, se, m, null, null, null, type, 'off')

	// Склад включен
	extra(building, null, obj, s, se, m, null, null, null, type, 'on')
	alr = alr || extralrm(building, null, obj, s, se, m, null, null, type, 'on')
	return alr
}
