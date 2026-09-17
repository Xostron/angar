const defInnerSec = require('./def')

function innerSec(obj) {
	if (!obj.data?.building || !obj.data?.section) return null
	return obj.data.section.reduce((acc, sec) => {
		const bld = obj.data.building.find((el) => el._id === sec.buildingId)
		if (!bld) return acc
		acc[bld._id] ??= {}
		// Содержимое секции
		acc[bld._id][sec._id] = defInnerSec?.[bld.type](bld, sec, obj)
		return acc
	}, {})
}

module.exports = innerSec
