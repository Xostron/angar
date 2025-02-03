const {data: store} = require('@store')

/**
 * Состояние склада: подрежим работы обычного склада
 * @param {*} equip 
 * @param {*} val 
 * @param {*} retain 
 * @param {*} result 
 */
function building(equip, val, retain, result) {
	const {building} = equip
	result.building ??= {}
	for (const bld of building) {
		result.building[bld._id] ??= {}
		const am = retain?.[bld._id]?.automode
		if (!am) continue
		result.building[bld._id].submode = store.acc?.[bld._id]?.[am]?.submode
	}
}

module.exports = building
