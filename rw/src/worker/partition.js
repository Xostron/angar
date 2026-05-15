const { store } = require('@store')

/**
 * Распределение модулей по потокам
 * @param {*} mdls Массив модулей на чтение
 * @param {*} count Кол-во потоков
 * @returns {object[][]} Возвращаем подмассивы с модулями,
 * для каждого потока свой набор модулей
 */
function partition(mdls, count) {
	if (!mdls?.length) return
	// Массив массивов
	const parts = new Array(count).fill()
	let i = 0
	// По модулям
	while (i < mdls.length) {
		// По потокам
		parts.forEach((_, j) => {
			// Создание подмассива
			if (!(parts[j] instanceof Array)) parts[j] = []
			// Добавляем модуль в подмассив
			mdls[i] ? parts[j].push(mdls[i]) : null
			// следующий модуль
			i++
		})
	}
	// Возвращаем результат массив с подмассивами, кол-во подмассивов равно кол-ву потоков
	// console.log(55, parts, mdls.length)
	return parts
}

// Распределение модулей - перерасчет при обновлении рамы
function fnParts(mdls, count) {
	// Расчет рапсределения модулей:
	// 1. Нет распределенных модулей
	// 2. Первый цикл
	// 3. Флаг обновления рамы
	if (!store.parts?.length || store._first || store._update) {
		store.parts = partition(mdls, count)
	}
}

module.exports = fnParts
