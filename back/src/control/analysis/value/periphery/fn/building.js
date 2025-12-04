const { data: store } = require('@store')
const { isCombiCold } = require('@tool/combi/is')
const { isAlr } = require('@tool/message/auto')

/**
 * Состояние склада: подрежим работы склада
 * normal, cold, combi_normal, combi_cold
 * @param {*} equip
 * @param {*} val
 * @param {*} retain
 * @param {*} result
 */
function building(equip, val, retain, result) {
	const { building } = equip
	result.building ??= {}
	for (const bld of building) {
		result.building[bld._id] ??= {}
		// Авторежим подрежимы хранения
		const am = retain?.[bld._id]?.automode
		if (am) result.building[bld._id].submode = store.acc?.[bld._id]?.[am]?.submode
		// Тип склада + режим: normal, cold, combi_normal, combi_cold
		// normal|cold
		if (bld.type !== 'combi') result.building[bld._id].bldType = bld.type
		// combi_normal | combi_cold
		result.building[bld._id].bldType = isCombiCold(bld, am, store.calcSetting[bld._id])
			? 'combi_cold'
			: 'combi_normal'
	}
}

module.exports = building
