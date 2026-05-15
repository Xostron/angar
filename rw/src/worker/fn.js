/**
 * Проверка кол-во модулей в results должно быть === кол-во модулей на чтение
 * @param {*} results Результат чтения модулей
 * @param {*} length Кол-во модулей, который должен содержать результат
 * @returns
 */
function check(results, length = 0) {
	if (Object.keys(results).length >= length) return results
}

module.exports = { check }
