const { data: store } = require('@store')
const checkSupply = require('../supply')

/**
 * @description Запрет работы склада
 * @param {object} bld Склад
 * @param {object} bdata Данные для конкретного склада
 * @param {boolean} alr Аварии extralrm
 * @param {string} stateCooler Состояние испарителя
 * @param {function} fnChange Замыкание - функция для изменения состояния испарителя
 * @returns {boolean} true - запрет работы, false - разрешено
 */
function denied(bld, sectM, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto: a, supply } = bdata
	// ATTENTION!: Аккумулятор вычислений cold ? Холодильник : Комбинированный
	const accAuto = bld?.type === 'cold' ? a : a.cold

	const supplySt = checkSupply(supply, bld._id, obj.retain)
	const aggr = isRunAgg(obj.value, bld._id)
	store.denied[bld._id] = !start || alr || !aggr || !supplySt || !enCombi(bld, sectM, automode)
	console.log(777, 'работа запрещена', store.denied[bld._id])

	// Работа холодильника запрещена
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

/**
 * @description Агрегат (группа компрессоров) готов?
 * @param {*} value Глобальные данные состояние и датчики
 * @param {*} idB id склада
 * @returns {boolean} true Агрегат готов
 */
function isRunAgg(value, idB) {
	return value.total[idB].aggregate?.state !== 'alarm' ? true : false
}

/**
 * @description Разрешение на работу для комбинированного склада
 * У комбинированного склада: 2 состояния: работа как обычный склад или как холодильник.
 * В качестве холодильника разрешено работать, только в режиме хранения (cooling),
 * и при наличии аварии авторежима.
 * @param {string} bld Склад
 * @param {string} automode Авторежим
 * @returns {boolean} true разрешить работу
 */
function enCombi(bld, sectM, automode) {
	switch (bld?.type) {
		case 'cold':
			// Разрешить работу: склад холодильник
			return true
		case 'combi':
			// Разрешить работу: комбинир. склад && режим хранения && наличие аварий авторежима хранения && секция в авто
			const isAutoAlr = Object.keys(store.alarm.auto?.[building._id]?.cooling ?? {}).length
			return automode === 'cooling' && isAutoAlr && sectM ? true : false
		default:
			// Для всего остального - запрет
			return false
	}
}
