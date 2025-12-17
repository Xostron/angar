const { ctrlVSoft, flyingVlv } = require('@tool/command/valve/auto')

/**
 * Приточный клапан (шаговое управление) TODO12
 * @param {*} building
 * @param {*} sect
 * @param {*} vlvS
 * @param {*} fanS
 * @param {*} obj
 * @param {*} alr Сумма аварий: доп. аварии, Авария авторежима, таймер запретов, авария склада, авария по низкой темпаературе
 * @param {*} v Команда на управлением клапаном от авторежима
 * @param {*} accAuto
 * @param {*} s
 * @returns
 */
function valve(building, sect, vlvS, fanS, obj, alr, v, accAuto, s) {
	if (!vlvS.length) return
	const haveFan = !!fanS.length
	const forceOff = alr || v.forceCls || !haveFan
	console.log(8800, 'forceOff =', alr, '||', v.forceCls, '||', !haveFan)
	ctrlVSoft(
		vlvS,
		building._id,
		sect._id,
		{
			valve: obj.retain?.[building._id]?.valve,
			valvePosition: obj.retain?.[building._id]?.valvePosition,
		},
		forceOff,
		v.forceOpn
	)
	// Выпускной клапан (следит за приточным клапаном)
	flyingVlv(building._id, sect._id, obj, accAuto, vlvS, s, forceOff)
}

// /**
//  * @param {*} fanS Вентиляторы секции
//  * @param {*} fanOff Вентиляторы выведенные из работы retain[build].fan
//  * @returns TRUE: Напорные вентиляторы секции выведены из работы
//  * False - есть рабочик
//  */
// function isOff(section, fanS, fanOff) {
// 	if (!fanS.length) return false
// 	const a = Object.values(fanOff?.[section._id] ?? {})
// 	return a.length === fanS.length ? a.every((el) => el === true) : false
// }

module.exports = { valve }
