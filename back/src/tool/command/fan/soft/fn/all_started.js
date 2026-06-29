const { compareTime } = require('@tool/command/time')
const _TIME = 1 * 60 * 1000 // 1 мин
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
function initAllStarted(acc, fans, fanFC, s, o) {
	const eI = edictumI(acc, fans, fanFC)
	const eII = edictumII(acc, s, o)

	// Флаг прогрев канала активен
	acc.allStarted = eI || eII ? new Date() : null

	// console.log(4110, 'allstarted=', acc.allStarted, eI, eII)
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
 * @returns {boolean} true - условия активны ()
 */
function edictumI(acc, fans, fanFC) {
	// Условия 1: прогрев канала полностью включен:
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
 * @returns {boolean}
 */
function edictumII(acc, s, o) {
	// Если активность регулирования каналом прогрева есть, то условие false
	if (o.on || o.off) {
		acc.edictumII = null
		return false
	}
	// Если активности регулирования нет, то засекаем время, после которого
	// установим флаг канал прогрева на максимуме = полность включен
	if (!o.on && !o.off && !acc?.edictumII) acc.edictumII = new Date()

	// Время (мс), после которого будет считаться что канал прогрева полностью включен
	let t = Math.max(s?.fan?.wait ?? 30) * 1000 + _TIME
	const time = compareTime(acc.edictumII, t)
	if (!time) return false
	// Время прошло, активности прогрева так и нет (из-за ограничения по давлению канала)
	// Включаем флаг прогрев канала
	return true
}
