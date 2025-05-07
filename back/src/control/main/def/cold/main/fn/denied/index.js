const { data: store } = require('@store')
const checkSupply = require('../supply')
const { isRunAgg, enCombi, clear } = require('./fn')

/**
 * @description Склад Холодиьник: Запрет работы испарителя
 * @param {object} bld Склад
 * @param {object} bdata Данные для конкретного склада
 * @param {boolean} alr Аварии extralrm
 * @param {string} stateCooler Состояние испарителя
 * @param {function} fnChange Замыкание - функция для изменения состояния испарителя
 * @returns {boolean} true - запрет работы, false - разрешено
 */
function deniedCold(bld, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto, supply } = bdata

	const supplySt = checkSupply(supply, bld._id, obj.retain)
	const aggr = isRunAgg(obj.value, bld._id)

	store.denied[bld._id] = !start || alr || !aggr || !supplySt
	console.log(777, 'работа запрещена', store.denied[bld._id])

	// Работа холодильника запрещена?
	// Нет
	if (!store.denied[bld._id]) return false
	// Да
	clear(bld._id, accAuto, fnChange, stateCooler, store)
	delete accAuto.target
	delete accAuto.targetDT
	console.log('\tОстановка из-за ошибок:')
	console.log('\t\tСклад остановлен:', !start)
	console.log('\t\tАвария:', alr)
	console.log('\t\tАгрегат готов к работ', !aggr)
	console.log('\t\tОжидание после включения питания', !supplySt)

	return true
}

// Комбинированный склад
function deniedCombi(bld, clr, sectM, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto: a, supply } = bdata

	const accAuto = a.cold
	const supplySt = checkSupply(supply, bld._id, obj.retain)
	const aggr = isRunAgg(obj.value, bld._id, clr._id)

	store.denied[bld._id] ??= {}
	store.denied[bld._id][clr._id] = !start || alr || !aggr || !supplySt || !enCombi(bld, sectM, automode)
	console.log(777, 'работа запрещена', store.denied[bld._id][clr._id])

	// Работа холодильника запрещена?
	// Нет
	if (!store.denied[bld._id]) return false
	// Да
	clear(bld._id, clr._id, accAuto, fnChange, stateCooler, store)
	console.log('\tОстановка из-за ошибок:')
	console.log('\t\tСклад остановлен:', !start)
	console.log('\t\tАвария:', alr)
	console.log('\t\tАгрегат готов к работ', !aggr)
	console.log('\t\tОжидание после включения питания', !supplySt)
	return true
}

module.exports = { cold: deniedCold, combi: deniedCombi }
