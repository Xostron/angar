const { isExtralrm } = require('@tool/message/extralrm')
const { readAcc } = require('@store/index')

// Разрешить вентиляцию (true)
function isAccess(bld, sect, obj, fanS, s, ban) {
	const extraCO2 = readAcc(bld._id, 'building', 'co2')
	// Отключение
	if (!fanS.length) return false
	// Режим вентиляции: Выкл
	if (!s?.vent?.mode || s?.vent?.mode === 'off') return false
	// Таймер запрета, аварийное закрытие клапанов, переключатель на щите (управление от щита)
	if (
		ban ||
		isExtralrm(bld._id, sect._id, 'alrClosed') ||
		isExtralrm(bld._id, sect._id, 'local') ||
		extraCO2.start
	)
		return false

	return true
}

module.exports = { isAccess }
