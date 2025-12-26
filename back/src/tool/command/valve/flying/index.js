const { readAcc } = require('@store/index')
const { fnCalc, vlvPercent } = require('./fn')
const fnCtrl = require('./step')

// Управление выпускным клапаном (для секции)
function flyingVlv(idB, idS, obj, vlvS, s, forceOff) {
	const { data, value, retain } = obj
	const acc = readAcc(idB)
	acc.vOut ??= {}

	// Приточный клапан
	const vIn = vlvS.find((el) => el.type === 'in')
	// Выпускной клапан
	const arrOut = vlvS.filter((el) => el.type === 'out')
	// Если несуществует - выход
	if (!vIn || !arrOut?.length) return
	// Параметры приточного клапана
	const oIn = {
		// Позиция, %
		posIn: vlvPercent(vIn?._id, obj.retain?.[idB]),
		// Коэффициент выпускного клапана
		k: s.sys?.cf?.kOut?.k ?? 1,
		// Коэффициент пропорциональности (из админки)
		kp: vIn?.kp ?? 1,
	}

	// Управление выпускным клапаном
	// Расчет задания: 1:1 (клапан:секция)
	fnCalc(idB, arrOut, obj, acc.vOut, oIn, s)

	// Управление выпускным клапаном
	fnCtrl(idB, arrOut, obj, acc.vOut, s, forceOff)
}

module.exports = flyingVlv
