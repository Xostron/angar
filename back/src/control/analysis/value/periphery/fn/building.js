const { data: store } = require('@store')
const { isAlr } = require('@tool/message/auto')

/**
 * Состояние склада: подрежим работы обычного склада
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
		// Тип склада + режим
		const alrAuto = isAlr(bld._id, am)
		if (am == 'drying') result.building[bld._id].typeMode = bld.type + '_normal'
		else if (am == 'cooling' && !alrAuto)
			result.building[bld._id].typeMode = bld.type + '_normal'
		else if (am == 'cooling' && alrAuto) result.building[bld._id].typeMode = bld.type + '_cold'

		// console.log(888, result.building, )
	}
}

module.exports = building
