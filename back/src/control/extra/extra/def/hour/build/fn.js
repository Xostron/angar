const { isDemo } = require('@tool/demo/fn/fn')
const { getSectAuto } = require('@tool/get/building')

/**
 * Запрет подсчета моточасов склада
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

/**
 * Склад не работает - Фиксируем конец подсчета
 * и вычисляем результат моточасов
 * @param {*} acc
 */
function fnEnd(acc) {
	// Если нет точки отсчета или текущего дня, то нечего считать - пропускаем
	if (!acc.start) return

	// Суммируем моточасы
	acc.total ??= 0

	if (Number.isNaN(acc.total)) acc.total = 0
	// Складываем суточные моточасы сушки, мс
	const start = typeof acc.start == 'string' ? new Date(acc.start) : acc.start
	acc.total += new Date() - start

	// Очищаем стартовую точку для следующего подсчета
	acc.start = new Date()
}

/**
 * Склад работает - Точка отсчета
 * @param {*} bld
 * @param {*} m
 * @param {*} obj
 * @returns
 */
function fnInit(acc) {
	// Склад работает - Инициализируем точку отсчета
	// Точка отсчета
	acc.start ??= new Date()

	// Аккумулятор моточасов
	acc.total ??= 0
}

module.exports = { isRunning, fnEnd, fnInit }
