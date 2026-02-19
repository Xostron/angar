/**
 * Комби-холод: регулирование температуры канала по заданию.
 * Флаг все ли узлы обогрева канала запущены (соленоиды подогрева, ВНО секции)
 * По данному флагу: начинается отсчет "Задержка выключения по низкой температуре канала"
 * (настройки: Холодильник С), после которого испарители полностью выключаются, обратно включаются когда
 * температура канала станет больше-равно температуры задания канала
 * Логика включения прогрева канала: функция cold - src\tool\command\fan\soft\fn\on_off.js
 * @param {*} acc
 */
function initAllStarted(acc, fans) {
	const r =
		acc.order >= fans.length - 1 &&
		!!acc.fc &&
		acc.fc.value &&
		acc.fc.sp >= 100 &&
		acc.sol.value
	if (r) acc.allStarted = new Date()
	else acc.allStarted = null
	
	console.log(
		411,
		'allstarted =[',
		acc.order >= fans.length - 1,
		!!acc.fc,
		acc.fc.value,
		acc.fc.sp >= 100,
		acc.sol.value,
		'] =',
		r,
	)
}

module.exports = initAllStarted
