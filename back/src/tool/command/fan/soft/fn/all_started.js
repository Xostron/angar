/**
 * Комби-холод: регулирование температуры канала по заданию канала
 *
 * По данному флагу: начинается отсчет "Задержка выключения по низкой температуре канала"
 * (настройки: Холодильник С), после которого соленоид испарителя отключается,
 * обратно включается когда температура канала станет >= температуры задания канала
 *
 * Логика включения прогрева канала: функция cold - src\tool\command\fan\soft\fn\on_off.js
 * @param {*} acc
 */
function initAllStarted(acc, fans, fanFC) {
	const eI = edictumI(acc, fans, fanFC)
	const eII = edictumII(acc, fans, fanFC)

	// Флаг прогрев канала активен
	acc.allStarted = eI || eII ? new Date() : null

	// console.log(411, 'allstarted=', acc.allStarted, r)
}

module.exports = initAllStarted

/**
 * Условие 1: все ли узлы обогрева канала запущены:
 * - ВНО секции
 * - Соленоиды подогрева
 * - ВНО ПЧ 100% (если имеется)
 * @param {*} acc
 * @param {*} fans
 * @param {*} fanFC
 * @returns
 */
function edictumI(acc, fans, fanFC) {
	// Условия 1: для подогрев канала полностью включен:
	// 1. все ВНО секции в работе
	// 2. соленоиды подогрева включены
	const reason = [
		[acc.order >= fans.length - 1, 'Запущены все ВНО'],
		[acc.solh.value, 'Соленоиды подогрева'],
	]
	// 3. ВНО ПЧ включен на 100%
	if (fanFC) reason.push([acc?.fc?.value && acc?.fc?.sp >= 100, 'ВНО ПЧ на 100%'])

	// Все условия true => Прогрев канала активен
	return reason.every((el) => el[0] === true)
}

/**
 * Условие 2: Ситуация при которой узлы прогрева канала не могут включиться
 * из-за ограничения по давлению канала p <= s.fan.maxp,
 * Здесь необходимо наблюдать что сигналы on_off не изменяются в течении долгого времени
 * и принудительно устанавливать флаг, что прогрев канала включен
 * @param {*} acc
 * @param {*} fans
 * @param {*} fanFC
 */
function edictumII(acc, fans, fanFC) {
	return false
}
