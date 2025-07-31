/**
 * Проверка все ли узлы обогрева канала запущены.
 * Если да - то последовательно отключаются соленоиды испарителя
 * @param {*} acc
 */
function isAllStarted(acc, fans) {
	if (acc.order >= fans.length - 1 && acc.fc && acc.fc.value && acc.fc.sp >= 100 && acc.sol.value)
		acc.allStarted = new Date()
	else acc.allStarted = undefined
}

module.exports = isAllStarted
