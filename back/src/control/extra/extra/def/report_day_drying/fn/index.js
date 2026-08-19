const { isRunning } = require('./allow')

/**
 * Сушка работает - Точка отсчета
 * @param {*} bld
 * @param {*} m
 * @param {*} obj
 * @returns
 */
function fnInit(bld, m, obj, acc) {
	// Сушка не работает
	if (!isRunning(bld._id, m.fanBB, obj)) {
		fnEnd(acc)
		return //console.log('Запрет check2')
	}

	// Сушка работает - Инициализируем точку отсчета
	// Точка отсчета
	acc.start ??= new Date()
	// Текущий день сушки
	acc.day ??= new Date().getDate()
	// Аккумулятор моточасов(вчерашний и сегодняшний дни)
	acc.total ??= {}
	acc.total[acc.day] ??= 0
}

/**
 * Сушка не работает - Фиксируем конец подсчета и вычисляем результат моточасов сушки
 * @param {*} acc
 */
function fnEnd(acc) {
	// Если нет точки отсчета или текущего дня, то нечего считать - пропускаем
	if (!acc.start || !acc.day) return

	// Суммируем моточасы за сутки
	acc.total ??= {}
	acc.total[acc.day] ??= 0
	if (Number.isNaN(acc.total[acc.day])) acc.total[acc.day] = 0
	// Складываем суточные моточасы сушки, мс
	const start = typeof acc.start == 'string' ? new Date(acc.start) : acc.start
	acc.total[acc.day] += new Date() - start

	// Очищаем стартовую точку для следующего подсчета
	delete acc.start

	// Очистка acc.total
	fnRotate(acc)
}

/**
 * Проверка изменения дня
 * @param {*} acc
 * @returns
 */
function check24h(acc) {
	if (!acc.day) return
	if (acc.day === new Date().getDate()) return // console.log('День еще не закончился')
	// Сменился день - фиксируем моточасы за сутки
	fnEnd(acc)
	// Новый день
	acc.day = new Date().getDate()
}

/**
 * Очистка аккумулятора моточасов сушки, от неактуальных дней
 *
 * @param {*} acc
 * @returns
 */
function fnRotate(acc) {
	if (!acc.day || Object.keys(acc.total ?? {}).length < 3) return

	// Массив акутальных дней в аккумуляторе (вчера и сегодня)
	const days = [String(getYesterday(acc.day)), String(acc.day)]

	// Удаляем из аккумулятора неактуальные дни
	for (const day in acc.total) {
		if (days.includes(day)) continue
		delete acc?.total?.[day]
	}
}

// Получить вчерашний день
function getYesterday(curDay) {
	return curDay - 1 > 0
		? curDay - 1
		: new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate()
}

module.exports = { fnInit, fnEnd, check24h, getYesterday, fnRotate }
