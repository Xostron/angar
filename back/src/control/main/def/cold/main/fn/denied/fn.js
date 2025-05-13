const { data: store } = require('@store')

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
// function enCombi(bld, sectM, automode) {
// 	switch (bld?.type) {
// 		case 'cold':
// 			// Разрешить работу: склад холодильник
// 			return true
// 		case 'combi':
// 			// Разрешить работу: комбинир. склад && режим хранения && наличие аварий авторежима хранения && секция в авто
// 			const isAutoAlr = Object.keys(store.alarm.auto?.[building._id]?.cooling ?? {}).length
// 			return automode === 'cooling' && isAutoAlr && sectM ? true : false
// 		default:
// 			// Для всего остального - запрет
// 			return false
// 	}
// }

/**
 * Очистка по испарителю (Холодильник)
 * @param {*} bldId
 * @param {*} accAuto
 * @param {*} fnChange
 * @param {*} stateCooler
 * @param {*} store
 */
function clear(bldId, clr, accAuto, fnChange, stateCooler, store) {
	delete accAuto?.state?.off
	delete accAuto.target
	delete accAuto.targetDT
	// Пропуск: Испаритель выключен или окуривание запущено
	if (stateCooler?.state === 'off-off-off' || store.smoking[bldId]?.work) return
	// Выключение всех узлов испарителя
	fnChange(clr._id, 0, 0, 0, 0)

	delete accAuto?.state?.off
}

/**
 * Очистка по испарителю (Комбинированный)
 * @param {*} bldId
 * @param {*} clr
 * @param {*} accAuto
 * @param {*} fnChange
 * @param {*} stateCooler
 * @param {*} store
 * @returns
 */
function clearCombi(bldId, clr, accAuto, fnChange, stateCooler, store) {
	delete accAuto?.cold?.[clr._id]?.state?.off

	// Пропуск: Испаритель выключен или окуривание запущено
	if (stateCooler?.state === 'off-off-off' || store.smoking[bldId]?.work) return
	// Выключение всех узлов испарителя

	fnChange(clr._id, 0, 0, 0, 0)

	delete accAuto?.cold?.[clr._id]?.state?.off
}

// Очистка аккумулятора холодильника
function clearBuild(bldId, accAuto) {
	const denied = Object.values(store.denied[bldId])
	// Если хотя бы 1 испаритель разрешен к работе -> выход без очистки
	if (!denied.every((el) => el)) return true
	// Все испарители запрещены к работе -> очистка
	delete accAuto.cold.target
	delete accAuto.cold.targetDT
	console.log(555, 'Все испарители запрещены')
	return false
}
module.exports = { isRunAgg, clear, clearCombi, clearBuild }
