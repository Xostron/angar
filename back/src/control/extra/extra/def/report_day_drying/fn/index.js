const { isDemo } = require('@tool/demo/fn/fn')
const { getSectAuto } = require('@tool/get/building')
// Месяцы сушки с августа по ноябрь (8-11)
const _MONTH = [8, 9, 10, 11]

/**
 * Точка отсчета
 * @param {*} bld
 * @param {*} m
 * @param {*} obj
 * @returns
 */
function fnStart(bld, m, obj, acc) {
	if (!check2(bld._id, m.fanBB, obj)) {
		fnEnd(acc)
		return console.log('Запрет check2')
	}
	// Фиксируем точку отсчета
	acc.start ??= new Date()
	acc.day ??= new Date().getDate()
	acc.total ??= {}
	acc.total[acc.day] ??= 0
	// delete acc.total
	// delete acc.hour
}

/**
 * Фиксируем конец подсчета и вычисляем результат моточасов сушки
 * @param {*} acc
 */
function fnEnd(acc) {
	acc.start ??= new Date()
	acc.day ??= new Date().getDate()
	acc.total ??= {}
	acc.total[acc.day] ??= 0
	if (acc.total[acc.day] === null) acc.total[acc.day] = 0
	// Складываем суточные моточасы сушки, мс
	acc.total[acc.day] += new Date() - (acc.start ?? 0)
	// Очищаем стартовую точку для следующего подсчета
	delete acc.start
}

/**
 * Смена дня
 * @param {*} acc
 * @returns
 */
function fnDay(acc) {
	if (acc.day === new Date().getDate()) return console.log('День еще не закончился')
	// Сменился день - складываем моточасы
	fnEnd(acc)
	delete acc.day
}

/**
 * Запрет суточного подсчета
 * Но без запрета на формирование ПУШ-сообщения
 * @param {*} idB
 * @param {*} obj
 * @returns true - Проверка пройдена (разрешить)
 */
function check2(idB, fanBB, obj) {
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
 * Глобальный запрет суточного подсчета
 * Выключает формирование ПУШ-сообщения
 * @param {*} idB
 * @param {*} obj
 * @returns true - Проверка пройдена (разрешить)
 */
function check1(idB, obj) {
	// Текущий месяц
	const mon = new Date().getMonth() + 1
	const reason = [
		[obj.retain?.[idB]?.automode != 'drying', 'Несоответсвие авторежима'],
		[!_MONTH.includes(mon), 'Вне сезона сушки (с августа по ноябрь)'],
	]
	const err = reason.filter((el) => el[0])
	return !err.length
}

module.exports = { check1, check2, fnStart, fnEnd, fnDay }
