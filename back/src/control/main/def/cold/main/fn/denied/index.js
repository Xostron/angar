const { data: store } = require('@store')
const checkSupply = require('../supply')
const { isRunAgg, clear, clearCombi } = require('./fn')
const { isAlr } = require('@tool/message/auto')
const { clearAchieve } = require('@tool/message/achieve')

/**
 * @description Склад Холодиьник: Запрет работы испарителя
 * @param {object} bld Склад
 * @param {object} bdata Данные для конкретного склада
 * @param {boolean} alr Аварии extralrm
 * @param {string} stateCooler Состояние испарителя
 * @param {function} fnChange Замыкание - функция для изменения состояния испарителя
 * @returns {boolean} true - запрет работы, false - разрешено
 */
function deniedCold(bld, sect, clr, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto, supply } = bdata
	store.denied[bld._id] ??= {}

	const supplySt = checkSupply(supply, bld._id, clr._id, obj.retain)
	const aggr = isRunAgg(obj.value, bld._id, clr._id)

	store.denied[bld._id][clr._id] = !start || alr || !aggr || !supplySt
	console.log(55, clr.name, sect.name, 'работа запрещена', store.denied[bld._id][clr._id])
	clearAchieve(bld, obj, accAuto, false, start)

	// Работа испарителя запрещена?
	// Нет
	if (!store.denied[bld._id][clr._id]) return false
	// Да
	clear(bld._id, clr, accAuto, fnChange, stateCooler, store)
	console.log('\tОстановка из-за ошибок:')
	console.log('\t\tСклад остановлен:', !start)
	console.log('\t\tАвария:', alr)
	console.log('\t\tАгрегат готов к работ', aggr)
	console.log('\t\tОжидание после включения питания', !supplySt)

	return true
}

// Комбинированный склад
function deniedCombi(bld, sect, clr, sectMode, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto, supply, automode } = bdata
	store.denied[bld._id] ??= {}

	const supplySt = checkSupply(supply, bld._id, clr._id, obj.retain)
	const aggr = isRunAgg(obj.value, bld._id, clr._id)
	const alrAuto = isAlr(bld._id, automode)

	store.denied[bld._id][clr._id] =
		!start || alr || !aggr || !supplySt || !sectMode || !store.toAuto?.[bld._id]?.[sect._id] || !alrAuto || automode != 'cooling'
	console.log(55, clr.name, sect.name, 'работа запрещена combi', store.denied[bld._id][clr._id])

	// Работа испарителя запрещена?
	// Нет
	if (!store.denied[bld._id][clr._id]) {
		return false
	}
	// Да
	clearCombi(bld._id, clr, accAuto.cold, fnChange, stateCooler, store, alrAuto)

	console.log('\tОстановка из-за ошибок:', store.denied[bld._id][clr._id])
	// console.log('\t\tСклад в работе:', start)
	// console.log('\t\tНет аварий комбинированного склада:', !alr)
	// console.log('\t\tАгрегат готов к работе', aggr)
	// console.log('\t\tОжидание после включения питания пройдено', supplySt)
	// console.log('\t\tСекция в Авто', sectMode)
	// console.log('\t\tПодготовка секции к авто пройдена', store.toAuto?.[bld._id]?.[sect._id])
	// console.log('\t\tАвария авторежима активна, можно работать', alrAuto)
	// console.log('\t\tСклад в режиме Хранения', automode == 'cooling')

	return true
}

function deniedSection(bld, sect,  bdata, alr, obj) {
	const { start, s, se, m, accAuto, supply, automode } = bdata

	store.denied[bld._id] ??= {}
	store.denied[bld._id][sect._id] ??= {}

	// Режим секции true-Авто
	const sectM = obj.retain?.[bld._id]?.mode?.[sect._id]
	// Наличие аварии авторежима
	const alrAuto = isAlr(bld._id, automode)

	store.denied[bld._id][sect._id] = !start || alr || !sectM || !store.toAuto?.[bld._id]?.[sect._id] || !alrAuto || automode != 'cooling'
	console.log(
		55,
		sect.name,
		'работа секции запрещена',
		store.denied[bld._id][sect._id],
		'==',
		!start,
		alr,
		!sectM,
		!store.toAuto?.[bld._id]?.[sect._id],
		!alrAuto,
		automode != 'cooling'
	)
	return store.denied[bld._id][sect._id]
}
module.exports = { cold: deniedCold, combi: deniedCombi, section: deniedSection }
