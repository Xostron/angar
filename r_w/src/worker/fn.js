/**
 * Распределение модулей по потокам
 * @param {*} mdls Массив модулей на чтение
 * @param {*} num Кол-во потоков
 * @returns {object[][]} Возвращаем подмассивы с модулями,
 * для каждого потока свой набор модулей
 */
function partition(mdls, num) {
	// Массив массивов
	const parts = new Array(num).fill()
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

/**
 * Проверка кол-во модулей в results должно быть === кол-во модулей на чтение
 * @param {*} results Результат чтения модулей
 * @param {*} length Кол-во модулей, который должен содержать результат
 * @returns
 */
function check(results, length = 0) {
	if (Object.keys(results).length >= length) return results
}

module.exports = { partition, check }
