const extralrm = require('@control/extra/extralrm')
const { extra, extraClear } = require('@control/extra/extra')
const main = require('./main/def')

// Склад холодильник
function cold(bld, obj, bdata) {
	// console.log(1111, `\t${bld?.type==='combi'? 'Комбинированный холод':'Холодильный'} склад - процесс`, bld?.type)
	// Доп функции
	const alr = runExtra(bld, obj, bdata)
	// Алгоритм управления камерой
	main[bld?.type](bld, obj, bdata, alr)
}

module.exports = cold

/**
 * @description Запуск обработки доп. функций (extra) и доп. аварий (extralrm)
 * @param {object} bld Склад
 * @param {object} obj Глобальные данные
 * @param {object} bdata Подготовленные данные для склада
 * @returns {boolean} true - авария, false - ОК: нет аварий
 */
function runExtra(bld, obj, bdata) {
	const { start, s, se, m, accAuto } = bdata
	let alr = false
	// Тип склада cold - холодильник, combi - комбинированный
	const type = bld?.type
	// Для склада холодильник
	let sect = null
	if (type === 'cold') sect = obj?.data?.section?.find((el) => el.buildingId === bld._id)
	// Всегда
	alr = alr || extralrm(bld, null, obj, s, se, m, null, null, type, 'always')
	extra(bld, sect, obj, s, se, m, null, null, null, type, 'always')

	// Склад выключен
	if (!start) {
		extra(bld, null, obj, s, se, m, null, null, null, type, 'off')
		return alr
	} else extraClear(bld, null, obj, s, se, m, null, null, null, type, 'off')

	// Склад включен
	extra(bld, null, obj, s, se, m, null, null, null, type, 'on')
	alr = alr || extralrm(bld, null, obj, s, se, m, null, null, type, 'on')
	return alr
}
