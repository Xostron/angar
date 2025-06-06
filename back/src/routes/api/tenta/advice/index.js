const { data: store } = require('@store')

// Данные для аналитики рекомендаций (аналитика по прогнозу погоды)
function advice() {
	return function (req, res) {
		const buildings = req.body
		const { retain, total, humAbs } = store.value
		const setting = store.calcSetting

		const r = {}
		buildings.forEach((bld) => {
			r[bld._id] = {
				start: retain?.[bld._id]?.start,
				automode: retain?.[bld._id]?.automode,
				product: retain?.[bld._id]?.product,
				tout: total.tout,
				hout: total.hout,
				tprd: total?.[bld._id]?.tprd,
				houtAbs: humAbs?.out?.[bld._id] ?? humAbs?.out?.com,
				hinAbs: humAbs?.in?.[bld._id],
				setting: {
					cooling: { target: setting?.[bld._id]?.cooling?.target },
				},
			}
		})
		res.json(r)
	}
}

module.exports = advice
