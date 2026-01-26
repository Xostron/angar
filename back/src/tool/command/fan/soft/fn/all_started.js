/**
 * Проверка все ли узлы обогрева канала запущены.
 * Если да - то последовательно отключаются соленоиды испарителя
 * @param {*} acc
 */
function initAllStarted(acc, fans) {
	const r =
		acc.order >= fans.length - 1 && acc.fc && acc.fc.value && acc.fc.sp >= 100 && acc.sol.value
	if (r) acc.allStarted = new Date()
	// Сброс флага все узлы запущены произойдет, после включения испарителя
	else acc.allStarted = null
	console.log(
		411,
		'allstarted=',
		acc.order,
		fans.length - 1,
		acc.fc,
		acc.fc.value,
		acc.fc.sp >= 100,
		acc.sol.value,
		'=',
		r,
	)
}

module.exports = initAllStarted
