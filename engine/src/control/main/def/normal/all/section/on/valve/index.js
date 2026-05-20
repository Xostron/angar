const ctrlVin = require('@tool/command/valve/vin')
const { fnLookCls } = require('@tool/command/valve')
const flyingVout = require('@tool/command/valve/vout')

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
	// Принудительное закрытие
	// 1. Аварии по секции
	// 2. Команда: принудительное закрытие
	// 3. Нет рабочих ВНО у секции
	// 4. Поиск закрытого концевика, если положение клапана = 0%
	const forceCls = alr || v.forceCls || !fanS.length || fnLookCls(bld, sect, vlvS, obj)

	// Управление приточным клапаном
	ctrlVin(
		vlvS,
		bld._id,
		sect._id,
		{
			valve: obj.retain?.[bld._id]?.valve,
			valvePosition: obj.retain?.[bld._id]?.valvePosition,
		},
		forceCls,
		v.forceOpn,
	)

	// Выпускной клапан (следит за приточным клапаном)
	flyingVout(bld._id, sect._id, obj, vlvS, s, forceCls)
}

module.exports = { valve }
