const { data: store } = require('@store')
const checkSupply = require('./supply')

/**
 * Запрет работы склада
 * @param {object} bld Склад
 * @param {object} bdata Данные для конкретного склада
 * @param {boolean} alr Аварии extralrm
 * @param {string} stateCooler Состояние испарителя
 * @param {function} fnChange Замыкание - функция для изменения состояния испарителя
 * @returns {boolean} true - запрещено работать, false - разрешено работать
 */
function denied(bld, bdata, alr, stateCooler, fnChange) {
	const { start, s, se, m, accAuto: a, supply } = bdata
	// Аккумулятор вычислений: Холодильник : Комбинированный
	const accAuto = bld?.type === 'cold' ? a : a.cold

	const supplySt = checkSupply(supply, bld._id, retain)
	const aggr = isRunAgg(obj.value, bld._id)

	// Работа склада запрещена
	store.denied[bld._id] = !start || alr || !aggr || !supplySt
	if (store.denied[bld._id]) {
		// console.log('\tОстановка из-за ошибок:')
		// console.log('\t\tСклад остановлен:', !start)
		// console.log('\t\tАвария:', alr)
		// console.log('\t\tАгрегат готов к работ', !aggr)
		// console.log('\t\tОжидание после включения питания', !supplySt)

		delete accAuto?.state?.off
		delete accAuto.target
		delete accAuto.targetDT

		// Пропуск: Испаритель выключен или окуривание запущено
		if (stateCooler?.state === 'off-off-off' || store.smoking[bld._id]?.work) return true
		// Выключение всех узлов испарителя
		fnChange(0, 0, 0, 0)
		delete accAuto?.state?.off
		return true
	}
	return false
}

module.exports = denied

function isRunAgg(value, idB) {
	return value.total[idB].aggregate.state !== 'alarm' ? true : false
}
