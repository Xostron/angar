const { data: store } = require('@store')
const checkSupply = require('../../supply')
const { isReadyAgg, clear } = require('../fn')
const { clearAchieve } = require('@tool/message/achieve')
const { getIdsS } = require('@tool/get/building')
/**
 * @description Склад Холодильник: Запрет работы испарителя
 * @param {object} bld Склад
 * @param {object} bdata Данные для конкретного склада
 * @param {boolean} alr Аварии extralrm
 * @param {string} stateCooler Состояние испарителя
 * @param {function} fnChange Замыкание - функция для изменения состояния испарителя
 * @returns {boolean} true - запрет работы, false - разрешено
 */
function deniedCold(bld, sect, clr, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto } = bdata
	store.denied[bld._id] ??= {}
	const idsS = getIdsS(obj.data.section, bld._id)
	const supplySt = checkSupply(bld, sect, clr, idsS, obj.retain)
	const aggr = isReadyAgg(obj.value, bld._id, clr._id)

	store.denied[bld._id][clr._id] =
		!start || alr || !aggr || !supplySt || stateCooler?.status === 'alarm'
	console.log(
		410,
		clr.name,
		sect.name,
		'работа запрещена',
		store.denied[bld._id][clr._id],
		'=',
		!start,
		alr,
		!aggr,
		!supplySt,
		stateCooler?.status === 'alarm',
	)
	// console.log('\tНеисправность модулей испарителя', stateCooler?.status === 'alarm')
	clearAchieve(bld, obj, accAuto, false, start)

	// Работа испарителя запрещена?
	// Нет
	if (!store.denied[bld._id][clr._id]) return false
	// Да
	clear(bld._id, clr, accAuto, fnChange, stateCooler, store)
	// console.log('\tОстановка из-за ошибок:')
	// console.log('\t\tСклад остановлен:', !start)
	// console.log('\t\tАвария:', alr)
	// console.log('\t\tАгрегат готов к работ', aggr)
	// console.log('\t\tОжидание после включения питания', !supplySt)

	return true
}

module.exports = deniedCold
