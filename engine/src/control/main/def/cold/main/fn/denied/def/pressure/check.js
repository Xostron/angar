const { isWorkVno } = require('@tool/command/mech/get')
const { compareTime } = require('@tool/command/time')
const _WAIT = 5000

/**
 * Проверка давления в канале, переключение сигнала для отключения испарителей
 * @param {*} idS
 * @param {*} mS
 * @param {*} s
 * @param {*} seS
 * @param {*} accAuto
 * @param {*} sectM
 * @param {*} obj
 * @returns
 */
function check(idS, mS, s, seS, accAuto, sectM, obj) {
	accAuto.cold ??= {}
	accAuto.cold[idS] ??= {}
	accAuto.cold[idS].waitPressure ??= null
	accAuto.cold[idS].pressure ??= -1

	// Секция не в авто -> сбрасываем denied.pressure
	if (!sectM) {
		accAuto.cold[idS].waitPressure = null
		accAuto.cold[idS].pressure = -1
	}
	// Давление в канале больше максимального
	// ВНО не запущены
	const reason = seS.p >= s.fan.maxp && !isWorkVno(mS.fanSS, obj.value)

	// флаг высокое давление от работающих испарителей,
	// разрешение на процедуру отключения (или 50%) испарителя
	// Сброс флага при выкл склада
	if (reason && !accAuto?.cold?.[idS]?.waitPressure) accAuto.cold[idS].waitPressure = new Date()
	if (!reason) accAuto.cold[idS].waitPressure = null

	// Ждем стабилизации давления -> Разрешить секции выключение испарителей
	const time = compareTime(accAuto.cold[idS].waitPressure, _WAIT)
	if (time) accAuto.cold[idS].pressure++

	return { reason }
}

module.exports = check
