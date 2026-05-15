/**
 * Проверка кол-во модулей в results должно быть === кол-во модулей на чтение
 * @param {*} count Кол-во потоков
 * @param {*} countWorker Кол-во завершенных потоков
 * @returns {boolean} true все потоки завершены => все модули прочитаны
 */
function check(count, countWorker) {
	if (countWorker >= count) return true
	return false
}

module.exports = { check }
