const { ctrlVSoft, fnLookCls } = require('@tool/command/valve/auto')
const flyingVlv = require('@tool/command/valve/flying')

/**
 * Приточный клапан (шаговое управление) TODO12
 * @param {*} bld
 * @param {*} sect
 * @param {*} vlvS Клапаны секции
 * @param {*} fanS
 * @param {*} obj
 * @param {*} alr Сумма аварий: доп. аварии, Авария авторежима, таймер запретов, авария склада, авария по низкой темпаературе
 * @param {*} v Команда на управлением клапаном от авторежима
 * @param {*} accAuto
 * @param {*} s
 * @returns
 */
function valve(bld, sect, vlvS, fanS, obj, alr, v, accAuto, s) {
	if (!vlvS.length) return
	// 1. Аварии
	// 2. Принудительное закрытие
	// 3. Нет рабочих ВНО у секции
	// 4. Поиск закрытого концевика, если положение клапана = 0
	const lookCls = fnLookCls(bld, sect, vlvS, obj)
	const forceCls = alr || v.forceCls || !fanS.length || lookCls
	console.log(8800, 'forceCls =', alr, '||', v.forceCls, '||', !fanS.length, '||', lookCls)

	ctrlVSoft(
		vlvS,
		bld._id,
		sect._id,
		{
			valve: obj.retain?.[bld._id]?.valve,
			valvePosition: obj.retain?.[bld._id]?.valvePosition,
		},
		forceCls,
		v.forceOpn
	)
	// Выпускной клапан (следит за приточным клапаном)
	flyingVlv(bld._id, sect._id, obj, vlvS, s, forceCls)
}

module.exports = { valve }
