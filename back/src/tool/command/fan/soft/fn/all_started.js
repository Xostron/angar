/**
 * Комби-холод: регулирование температуры канала по заданию.
 * Флаг все ли узлы обогрева канала запущены (соленоиды подогрева, ВНО секции)
 * По данному флагу: начинается отсчет "Задержка выключения по низкой температуре канала"
 * (настройки: Холодильник С), после которого испарители полностью выключаются, обратно включаются когда
 * температура канала станет больше-равно температуры задания канала
 * Логика включения прогрева канала: функция cold - src\tool\command\fan\soft\fn\on_off.js
 * @param {*} acc
 */
function initAllStarted(acc, fans, fanFC) {
	const reason = [
		[acc.order >= fans.length - 1, 'Запущены все ВНО'],
		[acc.solh.value, 'Соленоиды подогрева'],
	]
	if (fanFC) reason.push([acc?.fc?.value && acc?.fc?.sp >= 100, 'ВНО ПЧ на 100%'])
	console.log(22, reason)
	const r = reason.filter((el) => el[0] === false)
	// Если имеется хотя бы одна причина = false, то allStarted=null цеполчка подогрева не запущена
	if (!r.length) acc.allStarted = new Date()
	else acc.allStarted = null

	console.log(411, 'allstarted=', acc.allStarted, r)
}

module.exports = initAllStarted
