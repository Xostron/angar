const { isWorkVno } = require('@tool/command/mech/get')
const { compareTime } = require('@tool/command/time')
const _WAIT = 5000

function check(idS, mS, s, seS, accAuto, sectM, obj) {
	// Давление в канале больше максимального
	// ВНО не запущены
	// Секция в авто
	const reason = seS.p >= s.fan.maxp && !isWorkVno(mS.fanSS, obj.value) && sectM

	accAuto.cold ??= {}
	accAuto.cold[idS] ??= {}
	accAuto.cold[idS].waitPressure ??= null
	accAuto.cold[idS].pressure ??= null
	// флаг высокое давление от работающих испарителей,
	// разрешение на процедуру отключения (или 50%) испарителя
	// Сброс флага при выкл склада
	if (reason && !accAuto?.cold?.[idS]?.waitPressure) accAuto.cold[idS].waitPressure = new Date()
	if (!reason) accAuto.cold[idS].waitPressure = null

	// Ждем стабилизации давления -> Разрешить секции выключение испарителей
	const time = compareTime(accAuto.cold[idS].waitPressure, _WAIT)
	if (time) accAuto.cold[idS].pressure = new Date()

	return { reason }
}

module.exports = check
