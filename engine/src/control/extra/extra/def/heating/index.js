const {delExtra, wrExtra} = require('@tool/message/extra')
const { ctrlDO } = require('@tool/command/module_output')
const { msg } = require('@tool/message')

// Обогрев клапанов
function heating(building, section, obj, s, se, m, alarm, acc, data, ban) {
	const { tout } = se
	const { heatS } = m
	if (!s?.heating) return
	const t = s.heating.on
	const hyst = s.heating.hysteresis
	// Обогрев выкл
	if (typeof tout !== 'number' || typeof t !== 'number' || typeof hyst !== 'number' || !heatS?.length) {
		heatS.forEach((h) => ctrlDO(h, building._id, 'off'))
		delExtra(building._id, section._id, 'heating')
		return
	}
	// Включить подогрев
	if (tout <= t) {
		heatS.forEach((h) => ctrlDO(h, building._id, 'on'))
		if (!acc.flag) {
			acc.flag = true
			wrExtra(building._id, section._id, 'heating', {
				date: new Date(),
				...msg(building, section, 55),
			})
		}
	}
	// Выключить подогрев
	if (tout >= t + hyst) {
		heatS.forEach((h) => ctrlDO(h, building._id, 'off'))
		delExtra(building._id, section._id, 'heating')
	}
}
module.exports = heating
