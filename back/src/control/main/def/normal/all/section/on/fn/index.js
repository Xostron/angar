const { ctrlVSoft, flyingVlv } = require('@tool/command/valve/auto')

/**
 * Приточный клапан (шаговое управление)
 * @param {*} building
 * @param {*} sect
 * @param {*} vlvS
 * @param {*} fanS
 * @param {*} obj
 * @param {*} alr
 * @param {*} v
 * @param {*} accAuto
 * @param {*} s
 * @returns
 */
function valve(building, sect, vlvS, fanS, obj, alr, v, accAuto, s) {
	if (!vlvS.length) return
	const fanOff = isOff(sect, fanS, obj.retain?.[building._id].fan)
	const forceOff = alr || v.forceCls || fanOff
	ctrlVSoft(
		vlvS,
		building._id,
		sect._id,
		{
			valve: obj.retain?.[building._id]?.valve,
			valvePosition: obj.retain?.[building._id]?.valvePosition,
		},
		alr || v.forceCls || fanOff,
		v.forceOpn
	)
	// Выпускной клапан (следит за приточным клапаном)
	flyingVlv(building._id, sect._id, obj, accAuto, vlvS, s, forceOff)
}


/**
 * @param {*} fanS Вентиляторы секции
 * @param {*} fanOff Вентиляторы выведенные из работы retain[build].fan
 * @returns FALSE/TRUE: Напорные вентиляторы секции выведены из работы
*/
function isOff(section, fanS, fanOff) {
    if (!fanS.length) return false
	const a = Object.values(fanOff?.[section._id] ?? {})
	return a.length === fanS.length ? a.every((el) => el === true) : false
}

module.exports = { valve }