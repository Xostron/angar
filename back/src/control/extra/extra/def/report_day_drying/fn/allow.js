const { isDemo } = require('@tool/demo/fn/fn')
const { getSectAuto } = require('@tool/get/building')
// Месяцы сушки с августа по ноябрь (8-11)
const _MONTH = [8, 9, 10, 11]

/**
 * Глобальный запрет суточного подсчета
 * Выключает формирование ПУШ-сообщения
 * @param {*} idB
 * @param {*} obj
 * @returns true - Проверка пройдена (разрешить)
 */
function fnEnable(idB, obj) {
	// Текущий месяц
	const mon = new Date().getMonth() + 1
	const reason = [
		[obj.retain?.[idB]?.automode != 'drying', 'Несоответсвие авторежима'],
		[!_MONTH.includes(mon), 'Вне сезона сушки (с августа по ноябрь)'],
	]
	const err = reason.filter((el) => el[0])
	return !err.length
}

/**
 * Запрет суточного подсчета
 * Но без запрета на формирование ПУШ-сообщения
 * @param {*} idB
 * @param {*} obj
 * @returns true - Проверка пройдена (разрешить)
 */
function isRunning(idB, fanBB, obj) {
	const reason = [
		[isDemo(idB), 'ПНР-режим активен'],
		[!obj.retain?.[idB]?.start, 'Склад выключен'],
		[!getSectAuto(idB, obj).length, 'Нет секций в авто'],
		[fanBB.every((el) => obj.value[el._id].state != 'run'), 'Все ВНО выключены'],
	]
	const err = reason.filter((el) => el[0])
	return !err.length
}

module.exports = { fnEnable, isRunning }
