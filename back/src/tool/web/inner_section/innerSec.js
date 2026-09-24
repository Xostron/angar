const defInnerSec = require('./def')

function fnInnerSec(obj, sCard) {
	if (!obj.data?.building || !obj.data?.section) return null
	return obj.data.section.reduce((acc, sec) => {
		const bld = obj.data.building.find((el) => el._id === sec.buildingId)
		if (!bld) return acc
		acc[bld._id] ??= {}
		// Содержимое секции
		acc[bld._id][sec._id] = defInnerSec?.[bld.type](bld, sec, obj, sCard)
		return acc
	}, {})
}

module.exports = fnInnerSec
