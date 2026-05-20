/**
 * Проверка кол-во модулей в results должно быть === кол-во модулей на чтение
 * @param {*} count Кол-во потоков
 * @param {*} countWorker Кол-во завершенных потоков
 * @returns {boolean} true все потоки завершены => все модули прочитаны
 */
function check2(count, countWorker) {
	if (countWorker >= count) return true
	return false
}

/**
 * Проверка завершения всех воркеров
 * @param {*} num кол-во потоков
 * @param {*} finishedWorkers число завершенных воркеров
 * @returns
 */
function check(num, finishedWorkers, pool) {
	if (finishedWorkers >= num) {
		// Удаляем слушатели (утечки)
		pool.forEach((worker) => {
			worker.removeAllListeners('message')
			worker.removeAllListeners('error')
		})
		return true
	}
	return false
}

module.exports = { check }
