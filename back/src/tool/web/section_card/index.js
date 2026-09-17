const defScard = require('./def')

/**
 * Карточка секции
 * @param {*} obj
 * @returns
 */
function fnSCard(obj) {
	if (!obj.data?.building || !obj.data?.section) return null

	return obj.data.section.reduce((acc, sec) => {
		const bld = obj.data.building.find((el) => el._id === sec.buildingId)
		if (!bld) return acc
		acc[bld._id] ??= {}
		// Карточка секции
		acc[bld._id][sec._id] = defScard?.[bld.type](bld, sec, obj)
		return acc
	}, {})
}

// store.value = { ...obj.value, retain:obj.retain, factory:obj.factory, alarm: r }
module.exports = { fnSCard }
