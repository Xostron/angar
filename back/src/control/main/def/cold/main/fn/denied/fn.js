const { data: store } = require('@store')
const mes = require('@dict/message')
const { delAchieve } = require('@tool/message/achieve')

/**
 * @description Агрегат (группа компрессоров) готов?
 * @param {*} value Глобальные данные состояние и датчики
 * @param {*} idB id склада
 * @returns {boolean} true Агрегат готов
 */
function isReadyAgg(value, idB, aggListId) {
	return value.total[idB].aggregate.agg?.[aggListId] !== 'alarm' ? true : false
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
	console.log(
		'\x1b[33m%s\x1b[0m',
		'Очистка аккумулятора холодильника, т.к. испаритель запрещен к работе'
	)
	delete accAuto?.[clr._id]
	delete accAuto?.afterD
	delete accAuto?.timeAD
	delete accAuto?.defrostAllFinish
	delete accAuto?.drainAll
	delete accAuto?.defrostAll
	// Пропуск: Испаритель выключен или окуривание запущено
	if (
		stateCooler?.state === 'off-off-off' ||
		store?.smoking?.[bldId]?.work ||
		store?.ozon?.[bldId]?.work
	)
		return
	// Выключение всех узлов испарителя
	fnChange(0, 0, 0, 0, null, clr)

	delete accAuto?.[clr._id]
}

/**
 * Очистка по испарителю (Комбинированный)
 * @param {*} bldId
 * @param {*} clr
 * @param {*} accAuto
 * @param {*} fnChange
 * @param {*} stateCooler
 * @param {*} store
 * @param {} alrAuto авария авторежима
 * @param {boolean | null} sectM Режим секции
 * @returns
 */
function clearCombi(bldId, clr, s, accAuto, fnChange, stateCooler, store, alrAuto, sectM) {
	console.log(
		'\t\x1b[33m%s\x1b[0m',
		'Очистка аккумулятора холодильника, т.к. испаритель запрещен к работе'
	)
	delete accAuto?.cold?.[clr._id]
}

// Очистка аккумулятора холодильника
function clearBuild(bld, accAuto) {
	const denied = Object.values(store.denied[bld._id] ?? {})
	// Если хотя бы 1 испаритель разрешен к работе -> выход без очистки
	if (!denied.every((el) => el)) return true
	// Все испарители запрещены к работе -> очистка
	del[bld.type](accAuto)
	delAchieve(bld._id, bld.type, mes[80].code)
	// console.log(555, bld.type, 'Все испарители запрещены')
	return false
}

// Удаление полей для аккумулятора (комби, холод)
const del = {
	combi: (accAuto) => {
		accAuto.cold ??= {}
		accAuto.cold.tgtTprd = null
		accAuto.cold.tgtTcnl = null
		accAuto.cold.targetDT = null
		accAuto.cold.finishTarget = null
		accAuto.cold.finishTarget = null
		accAuto.cold.flagFinish = null
		accAuto.cold.defrostAll = null
		accAuto.cold.defrostAllFinish = null
		accAuto.cold.drainAll = null
		accAuto.cold.afterD = null
		accAuto.cold.timeAD = null
		delete accAuto?.cold?.softSol
	},
	cold: (accAuto) => {
		delete accAuto?.target
		delete accAuto?.targetDT
	},
}

module.exports = { isReadyAgg, clear, clearCombi, clearBuild }
