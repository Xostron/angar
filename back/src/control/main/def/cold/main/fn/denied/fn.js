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
 * Очистка по испарителю (Холодильник)
 * @param {*} bldId
 * @param {*} accAuto
 * @param {*} fnChange
 * @param {*} stateCooler
 * @param {*} store
 */
function clear(bldId, clr, accAuto, fnChange, stateCooler, store) {
	delete accAuto?.[clr._id]?.state?.off

	// Пропуск: Испаритель выключен или окуривание запущено
	if (stateCooler?.state === 'off-off-off' || store?.smoking?.[bldId]?.work) return
	// Выключение всех узлов испарителя
	fnChange(0, 0, 0, 0, null, clr)

	delete accAuto?.[clr._id]?.state?.off
}

/**
 * Очистка по испарителю (Комбинированный)
 * @param {*} bldId
 * @param {*} clr
 * @param {*} accAuto
 * @param {*} fnChange
 * @param {*} stateCooler
 * @param {*} store
 * @param {} alrAuto
 * @returns
 */
function clearCombi(bldId, clr, accAuto, fnChange, stateCooler, store, alrAuto) {
	delete accAuto?.cold?.[clr._id]?.state?.off

	// Пропуск: Испаритель выключен или окуривание запущено
	if (stateCooler?.state === 'off-off-off' || store.smoking[bldId]?.work) return

	// Выключение всех узлов испарителя
	// Если комбинированный склад работает как обычный, то разрешаем ВНО, остальные компоненты испарителя выключаем
	if (!alrAuto) fnChange(0, null, 0, 0, null, clr)
	// Если работает как холодильник, то выключаем весь испаритель
	else fnChange(0, 0, 0, 0, null, clr)

	delete accAuto?.cold?.[clr._id]?.state?.off
}

// Очистка аккумулятора холодильника
function clearBuild(bld, accAuto) {
	const denied = Object.values(store.denied[bld._id] ?? {})
	// Если хотя бы 1 испаритель разрешен к работе -> выход без очистки
	if (!denied.every((el) => el)) return true
	// Все испарители запрещены к работе -> очистка
	del[bld.type](accAuto)
	// console.log(555, bld.type, 'Все испарители запрещены')
	return false
}

// Удаление полей для аккумулятора (комби, холод)
const del = {
	combi: (accAuto) => {
		delete accAuto?.cold?.tgtTprd
		delete accAuto?.cold?.tgtTcnl
		delete accAuto?.cold?.targetDT
	},
	cold: (accAuto) => {
		delete accAuto?.target
		delete accAuto?.targetDT
	},
}

module.exports = { isRunAgg, clear, clearCombi, clearBuild }
